-- Ensure complete profile/settings consistency for all test accounts
-- This file is created as V8 to avoid checksum mismatch if V7 was already applied.

-- 1. Ensure all test accounts have UserDetails (required for login profile retrieval)
INSERT INTO user_details (id, user_id, full_name, avatar_url, created_at, updated_at)
SELECT gen_random_uuid(), u.id, u.full_name, u.avatar_url, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users u
WHERE u.email IN ('admin@smartlock.com', 'user@smartlock.com', 'owner@smartlock.com', 'control@smartlock.com', 'viewer@smartlock.com', 'nogrant@smartlock.com')
  AND NOT EXISTS (SELECT 1 FROM user_details ud WHERE ud.user_id = u.id);

-- 2. Ensure all test accounts have Notification Settings
INSERT INTO notification_settings (id, user_id, web_push_enabled, email_enabled, gas_alert_enabled, intruder_alert_enabled, wrong_pass_alert_enabled, fingerprint_alert_enabled, updated_at)
SELECT gen_random_uuid(), u.id, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP
FROM users u
WHERE u.email IN ('admin@smartlock.com', 'user@smartlock.com', 'owner@smartlock.com', 'control@smartlock.com', 'viewer@smartlock.com', 'nogrant@smartlock.com')
  AND NOT EXISTS (SELECT 1 FROM notification_settings ns WHERE ns.user_id = u.id);

-- 3. Ensure permissions for the main test device (33333333-3333-3333-3333-333333333333)
INSERT INTO user_devices (id, user_id, device_id, permission, granted_at)
SELECT gen_random_uuid(), u.id, '33333333-3333-3333-3333-333333333333', 
    CASE 
        WHEN u.email = 'admin@smartlock.com' THEN 'OWNER'
        WHEN u.email = 'owner@smartlock.com' THEN 'OWNER'
        WHEN u.email = 'control@smartlock.com' THEN 'CONTROL'
        WHEN u.email = 'viewer@smartlock.com' THEN 'VIEW_ONLY'
        ELSE 'VIEW_ONLY'
    END, 
    CURRENT_TIMESTAMP
FROM users u
WHERE u.email IN ('admin@smartlock.com', 'user@smartlock.com', 'owner@smartlock.com', 'control@smartlock.com', 'viewer@smartlock.com', 'nogrant@smartlock.com')
  AND EXISTS (SELECT 1 FROM devices WHERE id = '33333333-3333-3333-3333-333333333333')
  AND NOT EXISTS (SELECT 1 FROM user_devices ud WHERE ud.user_id = u.id AND ud.device_id = '33333333-3333-3333-3333-333333333333');
