-- V2__seed_data.sql

-- 1. Seed Users (password for all accounts is 'password')
INSERT INTO users (id, email, password_hash, full_name, avatar_url, role, is_active, created_at, updated_at) 
VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@smartlock.com', '$2a$10$EaQVNkkIFUdWPmXN5CAVQucljs2ujPmofSwiDaAZ8Rm/YzL5iQ.qi', 'Admin User', 'https://avatar.iran.liara.run/public/1', 'ADMIN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222222', 'user@smartlock.com', '$2a$10$EaQVNkkIFUdWPmXN5CAVQucljs2ujPmofSwiDaAZ8Rm/YzL5iQ.qi', 'John Doe', 'https://avatar.iran.liara.run/public/2', 'MEMBER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222223', 'owner@smartlock.com', '$2a$10$EaQVNkkIFUdWPmXN5CAVQucljs2ujPmofSwiDaAZ8Rm/YzL5iQ.qi', 'Olivia Owner', 'https://avatar.iran.liara.run/public/3', 'MEMBER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222224', 'control@smartlock.com', '$2a$10$EaQVNkkIFUdWPmXN5CAVQucljs2ujPmofSwiDaAZ8Rm/YzL5iQ.qi', 'Chris Control', 'https://avatar.iran.liara.run/public/4', 'MEMBER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222225', 'viewer@smartlock.com', '$2a$10$EaQVNkkIFUdWPmXN5CAVQucljs2ujPmofSwiDaAZ8Rm/YzL5iQ.qi', 'Vera Viewer', 'https://avatar.iran.liara.run/public/5', 'VIEWER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222226', 'nogrant@smartlock.com', '$2a$10$EaQVNkkIFUdWPmXN5CAVQucljs2ujPmofSwiDaAZ8Rm/YzL5iQ.qi', 'Nina No Grant', 'https://avatar.iran.liara.run/public/6', 'MEMBER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Seed Notification Settings
INSERT INTO notification_settings (id, user_id, web_push_enabled, email_enabled, gas_alert_enabled, intruder_alert_enabled, wrong_pass_alert_enabled, fingerprint_alert_enabled, updated_at)
VALUES
('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP),
('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP),
('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaab', '22222222-2222-2222-2222-222222222223', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP),
('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaac', '22222222-2222-2222-2222-222222222224', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP),
('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaad', '22222222-2222-2222-2222-222222222225', TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP),
('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaae', '22222222-2222-2222-2222-222222222226', FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP);

-- 3. Seed Devices
INSERT INTO devices (id, device_name, device_code, provider_type, provider_token, location, latitude, longitude, is_online, owner_id, created_at, updated_at)
VALUES
('33333333-3333-3333-3333-333333333333', 'Front Door Lock', 'SL-FRONT-001', 'BLYNK', 'INnoYtJ6zm9Rj-05xWV1hMb4H-XxbTve', 'Front Door', 21.0285, 105.8542, TRUE, '11111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('33333333-4444-4444-4444-444444444444', 'Back Door Lock', 'SL-BACK-002', 'ESP32', NULL, 'Back Door', 21.0286, 105.8543, FALSE, '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Seed User Devices (Sharing devices)
INSERT INTO user_devices (id, user_id, device_id, permission, granted_at)
VALUES
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'OWNER', CURRENT_TIMESTAMP),
('55555555-5555-5555-5555-555555555556', '22222222-2222-2222-2222-222222222222', '33333333-4444-4444-4444-444444444444', 'OWNER', CURRENT_TIMESTAMP),
('55555555-5555-5555-5555-555555555557', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'VIEW_ONLY', CURRENT_TIMESTAMP),
('55555555-5555-5555-5555-555555555558', '22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333333', 'OWNER', CURRENT_TIMESTAMP),
('55555555-5555-5555-5555-555555555559', '22222222-2222-2222-2222-222222222224', '33333333-3333-3333-3333-333333333333', 'CONTROL', CURRENT_TIMESTAMP),
('55555555-5555-5555-5555-55555555555a', '22222222-2222-2222-2222-222222222225', '33333333-3333-3333-3333-333333333333', 'VIEW_ONLY', CURRENT_TIMESTAMP);

-- 5. Seed Device Settings
INSERT INTO device_settings (id, device_id, lock_password_hash, gas_threshold, ldr_threshold, auto_lock_delay, auto_lock_enabled, gas_alert_enabled, pir_alert_enabled, max_pass_fail, keypad_lock_duration, light_duration, updated_at)
VALUES
('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '$2a$12$W9yG3y/a3z.K3pBthZ4XOuPj/9e3XbY9M.XwXfJ/.Fv1vMhV.6sF6', 1400, 500, 5, TRUE, TRUE, TRUE, 5, 300, 60, CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777777', '33333333-4444-4444-4444-444444444444', NULL, 1400, 500, 10, FALSE, TRUE, FALSE, 3, 120, 30, CURRENT_TIMESTAMP);

-- 6. Seed Fingerprints
INSERT INTO fingerprints (id, finger_slot_id, device_id, registered_by, person_name, access_level, is_active, registered_at, total_access_count)
VALUES
('88888888-8888-8888-8888-888888888888', 1, '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Admin Thumb', 'FULL', TRUE, CURRENT_TIMESTAMP, 15),
('99999999-9999-9999-9999-999999999999', 2, '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'John Index Finger', 'RESTRICTED', TRUE, CURRENT_TIMESTAMP, 5);

-- 7. Seed Access Logs
INSERT INTO access_logs (id, device_id, user_id, fingerprint_id, method, action, detail, created_at)
VALUES
('aaaaaaaa-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NULL, 'REMOTE', 'UNLOCKED', 'Unlocked via mobile app', CURRENT_TIMESTAMP),
('bbbbbbbb-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', NULL, '88888888-8888-8888-8888-888888888888', 'FINGERPRINT', 'UNLOCKED', 'Unlocked via fingerprint', CURRENT_TIMESTAMP);

-- 8. Seed Sensor Data
INSERT INTO sensor_data (id, device_id, gas_value, ldr_value, pir_triggered, temperature, weather_desc, recorded_at)
VALUES
('eeeeeeee-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 120, 600, FALSE, 26.5, 'Clear sky', CURRENT_TIMESTAMP),
('ffffffff-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 180, 450, FALSE, 27.1, 'Cloudy', CURRENT_TIMESTAMP);
