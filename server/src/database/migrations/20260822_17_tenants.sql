-- Multi-tenant foundation: a Tenant owns multiple Branches. This table alone doesn't change
-- any existing behavior -- branches.TenantId (added in the next migration) is what actually
-- links tenants to the rest of the schema.

CREATE TABLE IF NOT EXISTS tenants (
    TenantId INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Description TEXT NULL,
    ContactNo VARCHAR(30) NULL,
    Email VARCHAR(150) NULL,
    IsDeleted TINYINT(1) NOT NULL DEFAULT 0,
    DeletedBy INT NULL,
    DateDeleted DATETIME NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT NULL,
    UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UpdatedBy INT NULL,
    IsActive TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (TenantId)
) ENGINE=InnoDB;
