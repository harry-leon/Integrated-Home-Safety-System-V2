-- V1__init_schema.sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE devices (
    id UUID PRIMARY KEY,
    device_name VARCHAR(255) NOT NULL,
    device_code VARCHAR(255) NOT NULL UNIQUE,
    provider_type VARCHAR(50),
    provider_token VARCHAR(255),
    location VARCHAR(255),
    latitude FLOAT,
    longitude FLOAT,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP,
    owner_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE user_devices (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    device_id UUID NOT NULL,
    permission VARCHAR(50) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE device_settings (
    id UUID PRIMARY KEY,
    device_id UUID NOT NULL UNIQUE,
    lock_password_hash VARCHAR(255),
    gas_threshold INT DEFAULT 400,
    ldr_threshold INT DEFAULT 500,
    auto_lock_delay INT DEFAULT 5,
    auto_lock_enabled BOOLEAN DEFAULT TRUE,
    gas_alert_enabled BOOLEAN DEFAULT TRUE,
    pir_alert_enabled BOOLEAN DEFAULT TRUE,
    max_pass_fail INT DEFAULT 5,
    keypad_lock_duration INT DEFAULT 300,
    light_duration INT DEFAULT 60,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE fingerprints (
    id UUID PRIMARY KEY,
    finger_slot_id INT NOT NULL,
    device_id UUID NOT NULL,
    registered_by UUID,
    person_name VARCHAR(255),
    access_level VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_access TIMESTAMP,
    total_access_count INT DEFAULT 0,
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (registered_by) REFERENCES users(id)
);

CREATE TABLE access_logs (
    id UUID PRIMARY KEY,
    device_id UUID NOT NULL,
    user_id UUID,
    fingerprint_id UUID,
    method VARCHAR(50),
    action VARCHAR(50),
    detail VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (fingerprint_id) REFERENCES fingerprints(id)
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    device_id UUID NOT NULL,
    alert_type VARCHAR(50),
    severity VARCHAR(50),
    message VARCHAR(255),
    sensor_value INT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id)
);

CREATE TABLE sensor_data (
    id UUID PRIMARY KEY,
    device_id UUID NOT NULL,
    gas_value INT,
    ldr_value INT,
    pir_triggered BOOLEAN,
    temperature FLOAT,
    weather_desc VARCHAR(100),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE device_commands (
    id UUID PRIMARY KEY,
    device_id UUID NOT NULL,
    requested_by UUID,
    command_type VARCHAR(50),
    payload_json TEXT,
    status VARCHAR(50),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    completed_at TIMESTAMP,
    failure_reason TEXT,
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (requested_by) REFERENCES users(id)
);

CREATE TABLE notification_settings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    web_push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    gas_alert_enabled BOOLEAN DEFAULT TRUE,
    intruder_alert_enabled BOOLEAN DEFAULT TRUE,
    wrong_pass_alert_enabled BOOLEAN DEFAULT TRUE,
    fingerprint_alert_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE weekly_reports (
    id UUID PRIMARY KEY,
    device_id UUID NOT NULL,
    week_start DATE,
    week_end DATE,
    total_access_count INT DEFAULT 0,
    total_alert_count INT DEFAULT 0,
    total_failed_attempt_count INT DEFAULT 0,
    summary_json TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);
