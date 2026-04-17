-- V9__fix_incorrect_role_prefixes.sql
-- Clean up any 'ROLE_' prefixes that might have been accidentally inserted
-- This ensures compatibility with the UserRole enum in Java

UPDATE users SET role = 'ADMIN' WHERE role = 'ROLE_ADMIN';
UPDATE users SET role = 'MEMBER' WHERE role = 'ROLE_MEMBER';
UPDATE users SET role = 'VIEWER' WHERE role = 'ROLE_VIEWER';

-- Also ensure any potential case sensitivity issues are resolved
UPDATE users SET role = UPPER(role);
