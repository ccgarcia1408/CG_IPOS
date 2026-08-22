-- Adds Inventory Logs as a top-level Main Page (movement history for stock receipts,
-- deductions and adjustments — already served by GET /api/inventory/movements since Phase 3,
-- just missing a frontend page). Placed alongside Inventory/Purchasing before References, so
-- References is bumped from Sorting 7 to 8. Granted to Manager, Power User, and Inventory —
-- same audience as Purchasing; Cashier is excluded since this is a back-office report.

UPDATE menus SET Sorting = 8 WHERE Name = 'References' AND ParentMenuId IS NULL;

INSERT INTO menus (ParentMenuId, Name, Icon, Path, Sorting, IsActive, CreatedAt)
VALUES (NULL, 'Inventory Logs', 'BoxIcon', '/inventory-logs', 7, 1, NOW());

INSERT INTO menu_roles (MenuId, RoleId)
SELECT m.MenuId, r.RoleId
FROM menus m
INNER JOIN roles r ON r.RoleId IN (2, 3, 5) AND r.IsActive = 1 AND r.IsDeleted = 0
WHERE m.Path = '/inventory-logs'
  AND m.IsActive = 1
  AND m.IsDeleted = 0;
