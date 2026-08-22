-- Menus are static/seeded navigation data (no create/update/delete Stored Procedure exists for
-- this table by design). Products and Inventory shared the identical BoxCubeIcon, and every
-- References submenu item had Icon = NULL, so the sidebar silently fell back to the same
-- GridIcon for all six of them. Assigns a distinct, semantically appropriate icon per menu.

UPDATE menus SET Icon = 'BoxIcon' WHERE Path = '/products';
UPDATE menus SET Icon = 'BoxCubeIcon' WHERE Path = '/inventory';
UPDATE menus SET Icon = 'TableIcon' WHERE Name = 'References' AND ParentMenuId IS NULL;
UPDATE menus SET Icon = 'GroupIcon' WHERE Path = '/branch-maintenance';
UPDATE menus SET Icon = 'FolderIcon' WHERE Path = '/category-maintenance';
UPDATE menus SET Icon = 'UserCircleIcon' WHERE Path = '/user-maintenance';
UPDATE menus SET Icon = 'DollarLineIcon' WHERE Path = '/payment-method-maintenance';
UPDATE menus SET Icon = 'PlugInIcon' WHERE Path = '/supplier-maintenance';
UPDATE menus SET Icon = 'BoxIconLine' WHERE Path = '/terminal-maintenance';
