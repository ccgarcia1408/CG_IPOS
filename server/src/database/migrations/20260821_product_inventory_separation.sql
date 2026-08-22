-- One-time local-development migration. Back up cg_ipos_db before executing.
-- It preserves every legacy products.Stock value as an OPENING_BALANCE inventory movement.

START TRANSACTION;

CREATE TABLE IF NOT EXISTS inventories (
    InventoryId INT NOT NULL AUTO_INCREMENT,
    BranchId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 0,
    MinimumStock INT NOT NULL DEFAULT 0,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (InventoryId),
    UNIQUE KEY uq_inventories_branch_product (BranchId, ProductId),
    KEY ix_inventories_product (ProductId),
    CONSTRAINT fk_inventories_branch FOREIGN KEY (BranchId) REFERENCES branches (BranchId),
    CONSTRAINT fk_inventories_product FOREIGN KEY (ProductId) REFERENCES products (ProductId)
) ENGINE=InnoDB;

-- Preserve the current stock before removing product-owned stock. Products without a branch
-- cannot be converted automatically and are deliberately excluded for review.
INSERT INTO inventories (BranchId, ProductId, Quantity, MinimumStock)
SELECT p.BranchId, p.ProductId, COALESCE(p.Stock, 0), COALESCE(p.MinimumStock, 0)
FROM products p
WHERE p.BranchId IS NOT NULL
ON DUPLICATE KEY UPDATE Quantity = VALUES(Quantity), MinimumStock = VALUES(MinimumStock);

ALTER TABLE inventory_logs
    ADD COLUMN BranchId INT NULL AFTER InventoryLogId,
    ADD COLUMN TransactionType VARCHAR(32) NULL AFTER ProductId,
    ADD COLUMN ReferenceType VARCHAR(64) NULL AFTER TransactionType,
    ADD COLUMN Remarks VARCHAR(255) NULL AFTER ReferenceId,
    ADD KEY ix_inventory_logs_branch_product_created (BranchId, ProductId, CreatedAt),
    ADD CONSTRAINT fk_inventory_logs_branch FOREIGN KEY (BranchId) REFERENCES branches (BranchId);

UPDATE inventory_logs il
JOIN products p ON p.ProductId = il.ProductId
SET il.BranchId = p.BranchId,
    il.TransactionType = UPPER(il.Type),
    il.ReferenceType = CASE il.Type
        WHEN 'purchase' THEN 'PURCHASE'
        WHEN 'sale' THEN 'SALE'
        WHEN 'return' THEN 'SALE_RETURN'
        WHEN 'adjustment' THEN 'ADJUSTMENT'
        ELSE 'LEGACY'
    END
WHERE il.BranchId IS NULL;

-- Opening records make the migration visible in inventory history without changing inventory twice.
INSERT INTO inventory_logs (BranchId, ProductId, TransactionType, ReferenceType, Quantity, StockBefore, StockAfter, Remarks, IsDeleted, CreatedAt, CreatedBy)
SELECT i.BranchId, i.ProductId, 'OPENING_BALANCE', 'MIGRATION', i.Quantity, 0, i.Quantity, 'Migrated from products.Stock', 0, NOW(), p.CreatedBy
FROM inventories i JOIN products p ON p.ProductId = i.ProductId
WHERE NOT EXISTS (
    SELECT 1 FROM inventory_logs il WHERE il.BranchId = i.BranchId AND il.ProductId = i.ProductId AND il.TransactionType = 'OPENING_BALANCE' AND il.ReferenceType = 'MIGRATION'
);

ALTER TABLE products
    DROP FOREIGN KEY fk_products_BranchId,
    DROP INDEX fk_products_BranchId,
    DROP COLUMN BranchId,
    DROP COLUMN Stock,
    DROP COLUMN MinimumStock,
    ADD UNIQUE KEY uq_products_barcode (Barcode),
    ADD UNIQUE KEY uq_products_sku (SKU);

COMMIT;

-- Apply server/src/procedures/products/*.sql and server/src/procedures/inventories/sp_inventories_getAll.sql after this migration.
