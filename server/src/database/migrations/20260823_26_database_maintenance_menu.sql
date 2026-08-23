-- Adds a new top-level "System Configuration" menu with "Database Maintenance" as its only
-- submenu item (backup/restore of the whole database). This is destructive and admin-only, so
-- -- matching the Tenant Maintenance precedent -- no menu_roles rows are inserted: Administrator
-- (RoleId 1) sees every menu through the existing application rule and needs no explicit grant,
-- and every other role simply never gets a grant row for it, so it stays invisible to them.

INSERT INTO menus (ParentMenuId, Name, Icon, Path, Sorting, IsActive, CreatedAt)
VALUES (NULL, 'System Configuration', 'PlugInIcon', NULL, 9, 1, NOW());

INSERT INTO menus (ParentMenuId, Name, Icon, Path, Sorting, IsActive, CreatedAt)
SELECT MenuId, 'Database Maintenance', 'FolderIcon', '/database-maintenance', 1, 1, NOW()
FROM menus WHERE Name = 'System Configuration' AND ParentMenuId IS NULL;
