-- Forgot-password flow: a 6-digit numeric code + expiry stored directly on the user, cleared
-- once used or replaced by a newer request. No separate table needed -- at most one reset is
-- ever in flight per user.

ALTER TABLE users
    ADD COLUMN ResetCode VARCHAR(6) NULL AFTER Password,
    ADD COLUMN ResetCodeExpiresAt DATETIME NULL AFTER ResetCode;
