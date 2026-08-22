-- New reference-data modules: configurable discount types (e.g. Senior Citizen, PWD, Employee,
-- Promo) and tax rates (e.g. VAT), matching the existing payment_methods table shape. Not wired
-- into POS yet — that's a follow-up once these are populated with real values. Value/Rate
-- default to 0 so a newly created record never silently applies an unintended discount/tax.

CREATE TABLE IF NOT EXISTS discounts (
    DiscountId INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(255) NULL,
    `Type` ENUM('PERCENTAGE','FIXED') NOT NULL DEFAULT 'PERCENTAGE',
    Value DECIMAL(10,2) NOT NULL DEFAULT 0,
    IsDeleted TINYINT(1) NOT NULL DEFAULT 0,
    DeletedBy INT NULL,
    DateDeleted DATETIME NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT NULL,
    UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UpdatedBy INT NULL,
    IsActive TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (DiscountId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS taxes (
    TaxId INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(255) NULL,
    Rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    IsDeleted TINYINT(1) NOT NULL DEFAULT 0,
    DeletedBy INT NULL,
    DateDeleted DATETIME NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT NULL,
    UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UpdatedBy INT NULL,
    IsActive TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (TaxId)
) ENGINE=InnoDB;
