-- Seeding test users
-- Password hashes are for: admin123, member123, viewer123 respectively
-- Note: These are example BCrypt hashes.

INSERT INTO users (id, email, password_hash, full_name, role, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'admin@example.com', 
    '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 
    'System Admin', 
    'ADMIN', 
    true
);

INSERT INTO users (id, email, password_hash, full_name, role, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001', 
    'member@example.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgNo9sg7RE7zgWv8/F7vG/JbHBeS', 
    'Family Member', 
    'MEMBER', 
    true
);

INSERT INTO users (id, email, password_hash, full_name, role, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002', 
    'viewer@example.com', 
    '$2a$10$vI8meWAcE5s2f49g3.5Oou6j.8gVfK.9t9XjKzL.9t9XjKzL.9t9Xj', 
    'Guest Viewer', 
    'VIEWER', 
    true
);
