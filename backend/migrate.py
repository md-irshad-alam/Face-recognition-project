"""
migrate.py — Idempotent schema migrations.
Run once per deploy; safe to re-run (all ALTER TABLE errors are swallowed).
"""

import database


def _add_column_if_missing(cursor, table: str, column: str, definition: str):
    """ADD COLUMN only if it doesn't already exist (MySQL 8 compatible)."""
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
        print(f"  ✓ Added '{column}' to '{table}'")
    except Exception as e:
        msg = str(e).lower()
        if "duplicate column" in msg or "already exists" in msg or "1060" in str(e):
            pass  # already there — safe to continue
        else:
            print(f"  ! Note: Could not add {column} to {table}: {e}")


def migrate_db():
    conn = database.create_connection()
    if not conn:
        print("Failed to connect to database.")
        return

    try:
        cursor = conn.cursor()
        print("Running migrations…")

        # ── Legacy renames ────────────────────────────────────────────────────
        try:
            cursor.execute("ALTER TABLE students CHANGE program class_name VARCHAR(50);")
            print("  ✓ Renamed 'program' to 'class_name'")
        except Exception as e:
            if "1054" in str(e) or "doesn't exist" in str(e).lower():
                pass
            else:
                print(f"  ! Note: {e}")

        # ── Basic student columns (Phase 1) ───────────────────────────────────
        _add_column_if_missing(cursor, "students", "dob",              "DATE")
        _add_column_if_missing(cursor, "students", "is_on_hold",       "BOOLEAN DEFAULT FALSE")
        _add_column_if_missing(cursor, "students", "student_type",     "VARCHAR(50) DEFAULT 'Regular'")
        _add_column_if_missing(cursor, "students", "transport_type",   "VARCHAR(50) DEFAULT 'Self'")
        _add_column_if_missing(cursor, "students", "tuition_fee",      "DECIMAL(10,2) DEFAULT 0")
        _add_column_if_missing(cursor, "students", "transport_fee",    "DECIMAL(10,2) DEFAULT 0")
        _add_column_if_missing(cursor, "students", "hostel_fee",       "DECIMAL(10,2) DEFAULT 0")
        _add_column_if_missing(cursor, "students", "total_monthly_fee","DECIMAL(10,2) DEFAULT 0")
        _add_column_if_missing(cursor, "students", "last_payment_date","DATE")
        _add_column_if_missing(cursor, "students", "opening_balance",  "DECIMAL(10,2) DEFAULT 0")
        _add_column_if_missing(cursor, "students", "last_reminder_sent","TIMESTAMP NULL")

        # ── Multi-tenancy: school_id column on every tenant table ─────────────
        SCHOOL_COLS = {
            "users":          "VARCHAR(50) NOT NULL DEFAULT ''",
            "students":       "VARCHAR(50) NOT NULL DEFAULT ''",
            "teachers":       "VARCHAR(50) NOT NULL DEFAULT ''",
            "attendance":     "VARCHAR(50) NOT NULL DEFAULT ''",
            "exams":          "VARCHAR(50) NOT NULL DEFAULT ''",
            "leave_requests": "VARCHAR(50) NOT NULL DEFAULT ''",
            "leave_balances": "VARCHAR(50) NOT NULL DEFAULT ''",
            "devices":        "VARCHAR(50) NOT NULL DEFAULT ''",
            "payment_links":  "VARCHAR(50) NOT NULL DEFAULT ''",
        }
        for table, defn in SCHOOL_COLS.items():
            _add_column_if_missing(cursor, table, "school_id", defn)

        # ── Advanced Auth Columns for users ───────────────────────────────────
        _add_column_if_missing(cursor, "users", "is_verified",           "BOOLEAN DEFAULT FALSE")
        _add_column_if_missing(cursor, "users", "two_factor_secret",     "VARCHAR(100)")
        _add_column_if_missing(cursor, "users", "two_factor_enabled",    "BOOLEAN DEFAULT FALSE")
        _add_column_if_missing(cursor, "users", "failed_login_attempts", "INT DEFAULT 0")
        _add_column_if_missing(cursor, "users", "locked_until",          "TIMESTAMP NULL")

        # ── Advanced Auth Tables ──────────────────────────────────────────────
        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS verification_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL,
                token_hash VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_token_hash (token_hash),
                INDEX idx_email_token (email)
            )
            """)
            print("  ✓ Table 'verification_tokens' verified")
        except Exception as e:
            print(f"  ! Note: Could not create verification_tokens: {e}")

        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action VARCHAR(100) NOT NULL,
                details TEXT,
                ip_address VARCHAR(50),
                school_id VARCHAR(50) NOT NULL DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_action (user_id, action),
                INDEX idx_school_audit (school_id)
            )
            """)
            print("  ✓ Table 'audit_logs' verified")
        except Exception as e:
            print(f"  ! Note: Could not create audit_logs: {e}")

        # ── Fee Invoice Management Tables ─────────────────────────────────────
        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS fee_invoices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(50) NOT NULL,
                school_id VARCHAR(50) NOT NULL DEFAULT '',
                invoice_number VARCHAR(50) UNIQUE NOT NULL,
                month TINYINT NOT NULL,
                year INT NOT NULL,
                monthly_fee DECIMAL(10,2) DEFAULT 0,
                previous_due DECIMAL(10,2) DEFAULT 0,
                late_fine DECIMAL(10,2) DEFAULT 0,
                total_payable DECIMAL(10,2) DEFAULT 0,
                amount_paid DECIMAL(10,2) DEFAULT 0,
                balance_due DECIMAL(10,2) DEFAULT 0,
                status ENUM('PAID','PARTIALLY_PAID','UNPAID','OVERDUE') DEFAULT 'UNPAID',
                due_date DATE,
                generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                INDEX idx_invoice_student (student_id),
                INDEX idx_invoice_school (school_id),
                INDEX idx_invoice_month (year, month)
            )
            """)
            print("  ✓ Table 'fee_invoices' verified")
        except Exception as e:
            print(f"  ! Note: fee_invoices: {e}")

        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS fee_payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_id INT NOT NULL,
                student_id VARCHAR(50) NOT NULL,
                school_id VARCHAR(50) NOT NULL DEFAULT '',
                amount DECIMAL(10,2) NOT NULL,
                payment_method ENUM('CASH','UPI','BANK_TRANSFER','CHEQUE','DD','OTHER') DEFAULT 'CASH',
                reference_number VARCHAR(100),
                notes TEXT,
                payment_date DATE NOT NULL,
                recorded_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (invoice_id) REFERENCES fee_invoices(id) ON DELETE CASCADE,
                INDEX idx_payment_student (student_id),
                INDEX idx_payment_school (school_id)
            )
            """)
            print("  ✓ Table 'fee_payments' verified")
        except Exception as e:
            print(f"  ! Note: fee_payments: {e}")

        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS reminder_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(50) NOT NULL,
                school_id VARCHAR(50) NOT NULL DEFAULT '',
                invoice_id INT,
                phone VARCHAR(20),
                message TEXT,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_reminder_student (student_id)
            )
            """)
            print("  ✓ Table 'reminder_logs' verified")
        except Exception as e:
            print(f"  ! Note: reminder_logs: {e}")

        # ── Indexes for school_id (speeds up all tenant queries) ──────────────
        INDEXES = [
            ("students",       "idx_students_school",       "school_id"),
            ("teachers",       "idx_teachers_school",       "school_id"),
            ("attendance",     "idx_attendance_school",     "school_id"),
            ("exams",          "idx_exams_school",          "school_id"),
            ("leave_requests", "idx_leave_requests_school", "school_id"),
            ("devices",        "idx_devices_school",        "school_id"),
        ]
        for table, idx_name, col in INDEXES:
            try:
                cursor.execute(f"CREATE INDEX {idx_name} ON {table}({col})")
                print(f"  ✓ Created index {idx_name}")
            except Exception as e:
                if "duplicate key" in str(e).lower() or "1061" in str(e):
                    pass
                else:
                    print(f"  ! Note: index {idx_name}: {e}")

        # ── Student Flags (At-Risk tracking) ──────────────────────────────────
        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS student_flags (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(50) NOT NULL,
                school_id VARCHAR(50) NOT NULL DEFAULT '',
                flag_type ENUM('AT_RISK','LOW_ATTENDANCE','CONSECUTIVE_ABSENT','SUDDEN_DROP') NOT NULL,
                reason TEXT,
                attendance_pct DECIMAL(5,2) DEFAULT 0,
                consecutive_days INT DEFAULT 0,
                is_resolved BOOLEAN DEFAULT FALSE,
                notified BOOLEAN DEFAULT FALSE,
                flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP NULL,
                INDEX idx_flags_student (student_id),
                INDEX idx_flags_school (school_id),
                INDEX idx_flags_resolved (is_resolved)
            )
            """)
            print("  ✓ Table 'student_flags' verified")
        except Exception as e:
            print(f"  ! Note: student_flags: {e}")

        # ── Promotion Records ──────────────────────────────────────────────────
        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS promotion_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(50) NOT NULL,
                school_id VARCHAR(50) NOT NULL DEFAULT '',
                from_class VARCHAR(50) NOT NULL,
                from_section VARCHAR(20),
                to_class VARCHAR(50) NOT NULL,
                to_section VARCHAR(20),
                academic_year VARCHAR(20) NOT NULL,
                status ENUM('PENDING','APPROVED','REJECTED','COMPLETED') DEFAULT 'PENDING',
                notes TEXT,
                reviewed_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP NULL,
                INDEX idx_promo_student (student_id),
                INDEX idx_promo_school (school_id),
                INDEX idx_promo_status (status)
            )
            """)
            print("  ✓ Table 'promotion_records' verified")
        except Exception as e:
            print(f"  ! Note: promotion_records: {e}")

        # ── Notifications (bell icon) ──────────────────────────────────────────
        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                school_id VARCHAR(50) NOT NULL DEFAULT '',
                type ENUM('AT_RISK','ABSENT','FEE_DUE','PROMOTION','SYSTEM','LEAVE') NOT NULL,
                title VARCHAR(200) NOT NULL,
                message TEXT,
                student_id VARCHAR(50),
                student_name VARCHAR(200),
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_notif_school (school_id),
                INDEX idx_notif_read (is_read)
            )
            """)
            print("  ✓ Table 'notifications' verified")
        except Exception as e:
            print(f"  ! Note: notifications: {e}")

        conn.commit()
        print("Migration completed successfully.")

    except Exception as e:
        print(f"Critical error during migration: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()


if __name__ == "__main__":
    migrate_db()
