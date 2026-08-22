-- PurchaseDate was DATETIME, but it represents a calendar date (when the order was placed),
-- not a point in time — inconsistent with sales.Date and products.ManufacturingDate/ExpiryDate,
-- which are already DATE. Narrowing to the correct type; MariaDB truncates the time portion
-- automatically (only disposable dev/test rows exist, so nothing meaningful is lost).

ALTER TABLE purchases
    MODIFY COLUMN PurchaseDate DATE NOT NULL;
