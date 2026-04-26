-- Force test account passwords to a known bcrypt hash for the plaintext password: password

UPDATE users
SET password_hash = '$2a$10$EaQVNkkIFUdWPmXN5CAVQucljs2ujPmofSwiDaAZ8Rm/YzL5iQ.qi',
    updated_at = CURRENT_TIMESTAMP
WHERE email IN (
    'admin@smartlock.com',
    'user@smartlock.com',
    'owner@smartlock.com',
    'control@smartlock.com',
    'viewer@smartlock.com',
    'nogrant@smartlock.com'
);
