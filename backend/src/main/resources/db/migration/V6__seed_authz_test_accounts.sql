-- Seed additional test accounts for AuthZ verification on existing databases.
-- Password for all inserted accounts is: password

INSERT INTO users (id, email, password_hash, full_name, avatar_url, role, is_active, created_at, updated_at)
SELECT '22222222-2222-2222-2222-222222222223', 'owner@smartlock.com', '$2a$10$EaQVNkkIFUdWPmXN5CAVQucljs2ujPmofSwiDaAZ8Rm/YzL5iQ.qi', 'Olivia Owner', 'https://avatar.iran.liara.run/public/3', 'MEMBER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner@smartlock.com');

INSERT INTO users (id, email, password_hash, full_name, avatar_url, role, is_active, created_at, updated_at)
SELECT '22222222-2222-2222-2222-222222222224', 'control@smartlock.com', '$2a$10$EaQVNkkIFUdWPmXN5CAVQucljs2ujPmofSwiDaAZ8Rm/YzL5iQ.qi', 'Chris Control', 'https://avatar.iran.liara.run/public/4', 'MEMBER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'control@smartlock.com');

INSERT INTO users (id, email, password_hash, full_name, avatar_url, role, is_active, created_at, updated_at)
SELECT '22222222-2222-2222-2222-222222222225', 'viewer@smartlock.com', '$2a$10$EaQVNkkIFUdWPmXN5CAVQucljs2ujPmofSwiDaAZ8Rm/YzL5iQ.qi', 'Vera Viewer', 'https://avatar.iran.liara.run/public/5', 'VIEWER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'viewer@smartlock.com');

INSERT INTO users (id, email, password_hash, full_name, avatar_url, role, is_active, created_at, updated_at)
SELECT '22222222-2222-2222-2222-222222222226', 'nogrant@smartlock.com', '$2a$10$EaQVNkkIFUdWPmXN5CAVQucljs2ujPmofSwiDaAZ8Rm/YzL5iQ.qi', 'Nina No Grant', 'https://avatar.iran.liara.run/public/6', 'MEMBER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'nogrant@smartlock.com');

INSERT INTO notification_settings (id, user_id, web_push_enabled, email_enabled, gas_alert_enabled, intruder_alert_enabled, wrong_pass_alert_enabled, fingerprint_alert_enabled, updated_at)
SELECT 'aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaab', '22222222-2222-2222-2222-222222222223', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM notification_settings WHERE user_id = '22222222-2222-2222-2222-222222222223');

INSERT INTO notification_settings (id, user_id, web_push_enabled, email_enabled, gas_alert_enabled, intruder_alert_enabled, wrong_pass_alert_enabled, fingerprint_alert_enabled, updated_at)
SELECT 'aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaac', '22222222-2222-2222-2222-222222222224', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM notification_settings WHERE user_id = '22222222-2222-2222-2222-222222222224');

INSERT INTO notification_settings (id, user_id, web_push_enabled, email_enabled, gas_alert_enabled, intruder_alert_enabled, wrong_pass_alert_enabled, fingerprint_alert_enabled, updated_at)
SELECT 'aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaad', '22222222-2222-2222-2222-222222222225', TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM notification_settings WHERE user_id = '22222222-2222-2222-2222-222222222225');

INSERT INTO notification_settings (id, user_id, web_push_enabled, email_enabled, gas_alert_enabled, intruder_alert_enabled, wrong_pass_alert_enabled, fingerprint_alert_enabled, updated_at)
SELECT 'aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaae', '22222222-2222-2222-2222-222222222226', FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM notification_settings WHERE user_id = '22222222-2222-2222-2222-222222222226');

INSERT INTO user_devices (id, user_id, device_id, permission, granted_at)
SELECT '55555555-5555-5555-5555-555555555558', '22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333333', 'OWNER', CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM devices WHERE id = '33333333-3333-3333-3333-333333333333')
  AND NOT EXISTS (
      SELECT 1 FROM user_devices
      WHERE user_id = '22222222-2222-2222-2222-222222222223'
        AND device_id = '33333333-3333-3333-3333-333333333333'
  );

INSERT INTO user_devices (id, user_id, device_id, permission, granted_at)
SELECT '55555555-5555-5555-5555-555555555559', '22222222-2222-2222-2222-222222222224', '33333333-3333-3333-3333-333333333333', 'CONTROL', CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM devices WHERE id = '33333333-3333-3333-3333-333333333333')
  AND NOT EXISTS (
      SELECT 1 FROM user_devices
      WHERE user_id = '22222222-2222-2222-2222-222222222224'
        AND device_id = '33333333-3333-3333-3333-333333333333'
  );

INSERT INTO user_devices (id, user_id, device_id, permission, granted_at)
SELECT '55555555-5555-5555-5555-55555555555a', '22222222-2222-2222-2222-222222222225', '33333333-3333-3333-3333-333333333333', 'VIEW_ONLY', CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM devices WHERE id = '33333333-3333-3333-3333-333333333333')
  AND NOT EXISTS (
      SELECT 1 FROM user_devices
      WHERE user_id = '22222222-2222-2222-2222-222222222225'
        AND device_id = '33333333-3333-3333-3333-333333333333'
  );
