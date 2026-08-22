-- Lets a user upload their own profile picture (self-service, from the Profile page). Stored
-- on employees since that's where the rest of a user's personal info already lives
-- (FirstName/LastName/Address/etc.), not on users (credentials/account state).

ALTER TABLE employees
    ADD COLUMN ProfilePicture VARCHAR(255) NULL AFTER ContactNo;
