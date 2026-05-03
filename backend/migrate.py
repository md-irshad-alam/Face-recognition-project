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
