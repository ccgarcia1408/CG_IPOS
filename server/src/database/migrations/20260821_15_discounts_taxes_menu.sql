-- Adds Discount Maintenance and Tax Maintenance as References submenu items. These control
-- pricing adjustments applied at checkout, so — like OR Assignment Maintenance — they are
-- restricted to Manager and Power User only; Cashiers must not be able to change discount/tax
-- rules from the register.

INSERT INTO menus (ParentMenuId, Name, Icon, Path, Sorting, IsActive, CreatedAt)
SELECT MenuId, 'Discount Maintenance', 'PieChartIcon', '/discount-maintenance', 8, 1, NOW()
FROM menus WHERE Name = 'References' AND ParentMenuId IS NULL;

INSERT INTO menus (ParentMenuId, Name, Icon, Path, Sorting, IsActive, CreatedAt)
SELECT MenuId, 'Tax Maintenance', 'FileIcon', '/tax-maintenance', 9, 1, NOW()
FROM menus WHERE Name = 'References' AND ParentMenuId IS NULL;

INSERT INTO menu_roles (MenuId, RoleId)
SELECT m.MenuId, r.RoleId
FROM menus m
INNER JOIN roles r ON r.RoleId IN (2, 3) AND r.IsActive = 1 AND r.IsDeleted = 0
WHERE m.Path IN ('/discount-maintenance', '/tax-maintenance')
  AND m.IsActive = 1
  AND m.IsDeleted = 0;
