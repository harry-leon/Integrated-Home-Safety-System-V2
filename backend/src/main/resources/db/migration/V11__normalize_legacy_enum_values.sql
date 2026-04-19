-- Normalize legacy enum strings that can remain in local/dev H2 databases.
-- Hibernate enum mapping fails hard when old seed/test rows contain these values.

UPDATE alerts
SET alert_type = 'INTRUDER_ALERT'
WHERE alert_type = 'INTRUDER';

UPDATE access_logs
SET action = 'UNLOCKED'
WHERE action = 'UNLOCK';

UPDATE access_logs
SET action = 'LOCKED'
WHERE action = 'LOCK';
