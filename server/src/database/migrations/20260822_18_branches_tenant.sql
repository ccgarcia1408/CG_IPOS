-- Links every branch to a tenant. Existing branches predate the tenant concept, so a single
-- "Default Tenant" is created and backfilled onto every current row before the column is
-- locked to NOT NULL -- this keeps existing data valid without manual intervention.

INSERT INTO tenants (Name, Description, IsActive)
SELECT 'Default Tenant', 'Backfilled tenant for branches that existed before multi-tenancy.', 1
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE Name = 'Default Tenant');

ALTER TABLE branches
    ADD COLUMN TenantId INT NULL AFTER BranchId;

UPDATE branches
SET TenantId = (SELECT TenantId FROM tenants WHERE Name = 'Default Tenant' LIMIT 1)
WHERE TenantId IS NULL;

ALTER TABLE branches
    MODIFY COLUMN TenantId INT NOT NULL,
    ADD CONSTRAINT fk_branches_tenant FOREIGN KEY (TenantId) REFERENCES tenants(TenantId);
