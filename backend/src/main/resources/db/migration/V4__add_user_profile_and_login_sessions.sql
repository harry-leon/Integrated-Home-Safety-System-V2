CREATE TABLE user_details (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    gender VARCHAR(30),
    date_of_birth DATE,
    address VARCHAR(255),
    bio VARCHAR(1000),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_login_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    session_token_hash VARCHAR(128) NOT NULL UNIQUE,
    ip_address VARCHAR(120),
    user_agent VARCHAR(1024),
    device_name VARCHAR(255),
    location VARCHAR(255),
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logged_out_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO user_details (id, user_id, full_name, avatar_url, created_at, updated_at)
SELECT gen_random_uuid(), u.id, u.full_name, u.avatar_url, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_details ud WHERE ud.user_id = u.id
);
