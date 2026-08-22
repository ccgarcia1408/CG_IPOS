-- Adds Tenant Maintenance as a References submenu item. Tenants are the top of the new
-- multi-tenant hierarchy (Tenant -> Branch), so only Administrator may manage them --
-- Administrator (RoleId 1) sees every menu through the existing application rule and needs no
-- explicit grant here.

INSERT INTO menus (ParentMenuId, Name, Icon, Path, Sorting, IsActive, CreatedAt)
SELECT MenuId, 'Tenant Maintenance', 'BoxIcon', '/tenant-maintenance', 10, 1, NOW()
FROM menus WHERE Name = 'References' AND ParentMenuId IS NULL;
