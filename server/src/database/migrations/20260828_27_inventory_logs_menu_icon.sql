-- Inventory Logs shared the same BoxIcon as Products, and its icon looks identical to
-- Inventory's BoxCubeIcon at a glance. It's a movement-history/audit-trail page, so give it a
-- clock icon (already shipped as an unused sidebar icon) instead.

UPDATE menus SET Icon = 'TimeIcon' WHERE Path = '/inventory-logs';
