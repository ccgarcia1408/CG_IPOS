-- Lets the cashier-shift close calculation identify which payment method represents physical
-- cash, without matching on the fragile string "Cash" (which breaks silently if renamed).

ALTER TABLE payment_methods
    ADD COLUMN IsCash TINYINT(1) NOT NULL DEFAULT 0 AFTER Name;

UPDATE payment_methods
SET IsCash = 1
WHERE Name = 'Cash';
