-- Adds the Purchasing module to the sidebar, as a top-level Main Page alongside
-- Products/Inventory (not a References maintenance form). Granted to Manager, Power User, and
-- Inventory roles — Cashier is intentionally excluded, since purchasing/receiving is a
-- back-office function, not a checkout-counter task. Administrator (RoleId 1) sees every menu
-- through the existing application rule and needs no explicit grant.

INSERT INTO menus (ParentMenuId, Name, Icon, Path, Sorting, IsActive, CreatedAt)
VALUES (NULL, 'Purchasing', 'DownloadIcon', '/purchasing', 4, 1, NOW());

INSERT INTO menu_roles (MenuId, RoleId)
SELECT m.MenuId, r.RoleId
FROM menus m
INNER JOIN roles r ON r.RoleId IN (2, 3, 5) AND r.IsActive = 1 AND r.IsDeleted = 0
WHERE m.Path = '/purchasing'
  AND m.IsActive = 1
  AND m.IsDeleted = 0;
