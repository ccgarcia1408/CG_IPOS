-- Dynamic navigation grants for operational users.
-- Administrator (RoleId 1) receives all menus through the existing application rule.

ALTER TABLE menu_roles
    ADD UNIQUE KEY uq_menu_roles_menu_role (MenuId, RoleId);

INSERT INTO menu_roles (MenuId, RoleId)
SELECT m.MenuId, r.RoleId
FROM menus m
INNER JOIN roles r ON r.RoleId IN (2, 3, 4, 5) AND r.IsActive = 1 AND r.IsDeleted = 0
WHERE m.Path IN ('/dashboard', '/products', '/inventory')
  AND m.IsActive = 1
  AND m.IsDeleted = 0;
