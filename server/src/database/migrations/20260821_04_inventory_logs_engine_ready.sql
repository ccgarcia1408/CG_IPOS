-- Prepares inventory_logs for the new Inventory Movement Engine (sp_inventory_receiveStock /
-- deductStock / adjustStock). The table has been unused as a write path since the product/
-- inventory-separation migration added BranchId/TransactionType/ReferenceType/Remarks; the
-- legacy sp_inventory_logs_create/_update never adopted them and still write the old `Type`
-- enum instead. Verified live: both existing rows already use TransactionType/ReferenceType
-- exclusively (Type is NULL on both) — safe to drop `Type` now, before the engine starts
-- writing real data.
-- DDL implicitly commits in MariaDB, so this isn't wrapped in an explicit transaction.
-- MariaDB refuses to MODIFY a column that's part of an existing FK in the same statement,
-- so the branch FK is dropped and re-added around the MODIFY.

ALTER TABLE inventory_logs
    DROP FOREIGN KEY fk_inventory_logs_branch;

ALTER TABLE inventory_logs
    DROP COLUMN `Type`,
    MODIFY COLUMN BranchId INT NOT NULL,
    MODIFY COLUMN ProductId INT NOT NULL,
    MODIFY COLUMN TransactionType VARCHAR(32) NOT NULL,
    MODIFY COLUMN ReferenceType VARCHAR(64) NOT NULL,
    MODIFY COLUMN Quantity INT NOT NULL,
    MODIFY COLUMN StockBefore INT NOT NULL,
    MODIFY COLUMN StockAfter INT NOT NULL;

ALTER TABLE inventory_logs
    ADD CONSTRAINT fk_inventory_logs_branch FOREIGN KEY (BranchId) REFERENCES branches (BranchId),
    ADD KEY ix_inventory_logs_product (ProductId),
    ADD CONSTRAINT fk_inventory_logs_product FOREIGN KEY (ProductId) REFERENCES products (ProductId);
