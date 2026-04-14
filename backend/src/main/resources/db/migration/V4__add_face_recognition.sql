-- V4__add_face_recognition.sql
CREATE TABLE faces (
    id UUID PRIMARY KEY,
    face_slot_id INT,
    device_id UUID NOT NULL,
    registered_by UUID,
    person_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    registered_at TIMESTAMP,
    last_access TIMESTAMP,
    total_access_count INT DEFAULT 0,
    CONSTRAINT fk_face_device FOREIGN KEY (device_id) REFERENCES devices(id),
    CONSTRAINT fk_face_user FOREIGN KEY (registered_by) REFERENCES users(id)
);
