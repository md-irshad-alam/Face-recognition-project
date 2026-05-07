
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    class_name VARCHAR(50),
    section VARCHAR(10),
    email VARCHAR(100),
    phone VARCHAR(20),
    parent_phone VARCHAR(20),
    dob DATE,
    admission_date DATE,
    photo_url VARCHAR(255),
    student_type VARCHAR(50) DEFAULT 'Regular',
    transport_type VARCHAR(50) DEFAULT 'Self',
    tuition_fee DECIMAL(10, 2) DEFAULT 0,
    transport_fee DECIMAL(10, 2) DEFAULT 0,
    hostel_fee DECIMAL(10, 2) DEFAULT 0,
    total_monthly_fee DECIMAL(10, 2) DEFAULT 0,
    last_payment_date DATE,
    opening_balance DECIMAL(10, 2) DEFAULT 0,
    last_reminder_sent TIMESTAMP NULL,
    is_on_hold BOOLEAN DEFAULT FALSE,
    school_id VARCHAR(50) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50),
    date DATE NOT NULL,
    check_in_time TIME,
    status VARCHAR(20) DEFAULT 'Present',
    school_id VARCHAR(50) NOT NULL DEFAULT '',
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(100),
    google_id VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    school_id VARCHAR(50) NOT NULL DEFAULT '',
    is_verified BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(100),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token_hash (token_hash),
    INDEX idx_email_token (email)
);

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
);

CREATE TABLE IF NOT EXISTS teachers (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    highest_education VARCHAR(100),
    years_of_experience INT,
    specialization VARCHAR(100),
    department VARCHAR(100),
    bio TEXT,
    office_days VARCHAR(100),
    office_time VARCHAR(100),
    assigned_classes TEXT,
    notifications TEXT,
    status VARCHAR(20) DEFAULT 'active',
    is_phd BOOLEAN DEFAULT FALSE,
    photo_url VARCHAR(255),
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'teacher',
    school_id VARCHAR(50) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    duration INT NOT NULL,
    schedule_type VARCHAR(50),
    exam_type VARCHAR(50),
    proctor_base BOOLEAN DEFAULT FALSE,
    school_id VARCHAR(50) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT,
    question TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_option VARCHAR(10) NOT NULL,
    marks INT DEFAULT 1,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS devices (
    device_id VARCHAR(100) PRIMARY KEY,
    device_name VARCHAR(100),
    device_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    battery_level INT DEFAULT 0,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ip_address VARCHAR(50)
);
CREATE TABLE IF NOT EXISTS leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id VARCHAR(50),
    sick_leave INT DEFAULT 15,
    casual_leave INT DEFAULT 10,
    earned_leave INT DEFAULT 30,
    academic_year VARCHAR(10),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id VARCHAR(50),
    leave_type ENUM('sick', 'casual', 'earned'),
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    status ENUM('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED') DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL,
    fee_type VARCHAR(100) NOT NULL,
    gateway_link_id VARCHAR(100) UNIQUE,
    link_url TEXT,
    status ENUM('PENDING', 'PAID', 'EXPIRED', 'CANCELLED') DEFAULT 'PENDING',
    payment_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);
