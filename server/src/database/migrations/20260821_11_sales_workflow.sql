-- Adds what the POS/Sales workflow needs: which branch/terminal a sale happened at (BD4), and
-- turns official_receipts into the authoritative OR registry a sale's ORId points to (BD5),
-- instead of a loose, unenforced ORNo copy. Tables are empty in dev, so no backfill needed.
-- New sale_returns table: a partial-quantity return is a distinct, append-only ledger entry —
-- NOT a mutation of the original sale, which must stay historically accurate for audit.

ALTER TABLE sales
    ADD COLUMN BranchId INT NULL AFTER SaleId,
    ADD COLUMN TerminalId INT NULL AFTER BranchId,
    ADD COLUMN ORId INT NULL AFTER ORNo;

ALTER TABLE sales
    MODIFY COLUMN BranchId INT NOT NULL,
    MODIFY COLUMN TerminalId INT NOT NULL,
    ADD CONSTRAINT fk_sales_BranchId FOREIGN KEY (BranchId) REFERENCES branches (BranchId),
    ADD CONSTRAINT fk_sales_TerminalId FOREIGN KEY (TerminalId) REFERENCES terminals (TerminalId),
    ADD CONSTRAINT fk_sales_ORId FOREIGN KEY (ORId) REFERENCES official_receipts (ORId);

ALTER TABLE official_receipts
    ADD COLUMN ORAssignmentId INT NULL AFTER ORNo,
    MODIFY COLUMN Status ENUM('AVAILABLE','ISSUED','VOIDED') NULL;

ALTER TABLE official_receipts
    MODIFY COLUMN ORAssignmentId INT NOT NULL,
    ADD CONSTRAINT fk_official_receipts_ORAssignmentId FOREIGN KEY (ORAssignmentId) REFERENCES official_receipt_assignments (ORAssignmentId);

CREATE TABLE IF NOT EXISTS sale_returns (
    SaleReturnId INT NOT NULL AUTO_INCREMENT,
    SaleId INT NOT NULL,
    SaleItemId INT NOT NULL,
    ProductId INT NOT NULL,
    BranchId INT NOT NULL,
    QuantityReturned INT NOT NULL,
    RefundAmount DECIMAL(10,2) NOT NULL,
    Reason VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT NULL,
    PRIMARY KEY (SaleReturnId),
    KEY ix_sale_returns_sale (SaleId),
    KEY ix_sale_returns_sale_item (SaleItemId),
    CONSTRAINT fk_sale_returns_sale FOREIGN KEY (SaleId) REFERENCES sales (SaleId),
    CONSTRAINT fk_sale_returns_sale_item FOREIGN KEY (SaleItemId) REFERENCES sale_items (SaleItemId),
    CONSTRAINT fk_sale_returns_product FOREIGN KEY (ProductId) REFERENCES products (ProductId),
    CONSTRAINT fk_sale_returns_branch FOREIGN KEY (BranchId) REFERENCES branches (BranchId)
) ENGINE=InnoDB;
