-- Adds what the Purchasing/Receiving workflow needs that the original generic-CRUD schema
-- never had: which branch is receiving the stock, and a real cancellation trail matching the
-- pattern sales already has (IsCancelled/CancelledBy/DateCancelled/CancelReason).

ALTER TABLE purchases
    ADD COLUMN BranchId INT NULL AFTER PurchaseId,
    ADD COLUMN CancelReason VARCHAR(255) NULL AFTER Status,
    ADD COLUMN CancelledBy INT NULL AFTER CancelReason,
    ADD COLUMN DateCancelled DATETIME NULL AFTER CancelledBy;

-- No existing purchase rows (table is empty in dev), so there is no legacy data to backfill.
-- BranchId is required for every purchase going forward.
ALTER TABLE purchases
    MODIFY COLUMN BranchId INT NOT NULL,
    ADD CONSTRAINT fk_purchases_BranchId FOREIGN KEY (BranchId) REFERENCES branches (BranchId);
