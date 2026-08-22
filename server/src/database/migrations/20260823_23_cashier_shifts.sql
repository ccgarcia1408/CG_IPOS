-- Cashier shift tracking (open/close, cash variance) -- a genuinely new capability, no prior
-- table or workflow existed for this. Deliberately NOT wired into sp_sales_completeSale: shifts
-- track independently by aggregating sales within the shift's open/close time window, so the
-- existing, already-shipped checkout flow is completely unaffected.
--
-- Lifecycle rules (enforced at the stored-procedure level, not via DB constraints, since
-- MariaDB has no partial/filtered unique index): one active (Status='OPEN') shift per cashier,
-- one active shift per terminal, and only the cashier who opened a shift may close it.

CREATE TABLE IF NOT EXISTS cashier_shifts (
    CashierShiftId INT NOT NULL AUTO_INCREMENT,
    CashierId INT NOT NULL,
    BranchId INT NOT NULL,
    TerminalId INT NOT NULL,
    Status ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
    OpeningCash DECIMAL(10,2) NOT NULL,
    OpenedAt DATETIME NOT NULL,
    ClosingCash DECIMAL(10,2) NULL,
    ExpectedCash DECIMAL(10,2) NULL,
    Variance DECIMAL(10,2) NULL,
    ClosedAt DATETIME NULL,
    IsDeleted TINYINT(1) NOT NULL DEFAULT 0,
    DeletedBy INT NULL,
    DateDeleted DATETIME NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT NULL,
    UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UpdatedBy INT NULL,
    PRIMARY KEY (CashierShiftId),
    CONSTRAINT fk_cashier_shifts_cashier FOREIGN KEY (CashierId) REFERENCES users(UserId),
    CONSTRAINT fk_cashier_shifts_branch FOREIGN KEY (BranchId) REFERENCES branches(BranchId),
    CONSTRAINT fk_cashier_shifts_terminal FOREIGN KEY (TerminalId) REFERENCES terminals(TerminalId)
) ENGINE=InnoDB;
