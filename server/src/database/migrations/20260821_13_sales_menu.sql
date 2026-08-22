-- Adds POS and Sales History as top-level Main Pages, and Official Receipt Assignment as a
-- References submenu (an admin/supervisory function — cashiers must not be able to grant
-- themselves OR ranges, so it is deliberately not included in the Cashier grant below).
-- POS/Sales History are granted to Manager, Power User, and Cashier — Inventory role is
-- excluded, mirroring Purchasing's exclusion of Cashier: each role sees what's relevant to it.

INSERT INTO menus (ParentMenuId, Name, Icon, Path, Sorting, IsActive, CreatedAt)
VALUES
    (NULL, 'POS', 'PageIcon', '/pos', 5, 1, NOW()),
    (NULL, 'Sales History', 'TaskIcon', '/sales-history', 6, 1, NOW());

INSERT INTO menus (ParentMenuId, Name, Icon, Path, Sorting, IsActive, CreatedAt)
SELECT MenuId, 'OR Assignment Maintenance', 'DocsIcon', '/or-assignment-maintenance', 7, 1, NOW()
FROM menus WHERE Name = 'References' AND ParentMenuId IS NULL;

INSERT INTO menu_roles (MenuId, RoleId)
SELECT m.MenuId, r.RoleId
FROM menus m
INNER JOIN roles r ON r.RoleId IN (2, 3, 4) AND r.IsActive = 1 AND r.IsDeleted = 0
WHERE m.Path IN ('/pos', '/sales-history')
  AND m.IsActive = 1
  AND m.IsDeleted = 0;

INSERT INTO menu_roles (MenuId, RoleId)
SELECT m.MenuId, r.RoleId
FROM menus m
INNER JOIN roles r ON r.RoleId IN (2, 3) AND r.IsActive = 1 AND r.IsDeleted = 0
WHERE m.Path = '/or-assignment-maintenance'
  AND m.IsActive = 1
  AND m.IsDeleted = 0;
