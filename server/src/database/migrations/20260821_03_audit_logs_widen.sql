-- audit_logs.OldValue/NewValue were VARCHAR(255). Every module's Stored Procedures insert a
-- JSON_OBJECT(...) snapshot into these columns; anything beyond ~255 chars was silently
-- truncated, corrupting the audit trail. Widen to TEXT (no data loss, columns stay nullable).

ALTER TABLE audit_logs
    MODIFY COLUMN OldValue TEXT NULL,
    MODIFY COLUMN NewValue TEXT NULL;
