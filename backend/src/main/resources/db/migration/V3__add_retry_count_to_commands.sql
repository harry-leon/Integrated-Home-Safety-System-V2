-- V3__add_retry_count_to_commands.sql
ALTER TABLE device_commands ADD COLUMN retry_count INT DEFAULT 0;
