-- V10__fix_user_role_mappings.sql
-- Further cleanup for legacy roles not covered in V9

UPDATE users SET role = 'MEMBER' WHERE role = 'ROLE_USER' OR role = 'USER';

-- Final safety check
UPDATE users SET role = 'ADMIN' WHERE role = 'ROLE_ADMIN';
UPDATE users SET role = 'VIEWER' WHERE role = 'ROLE_VIEWER';
UPDATE users SET role = UPPER(role);
