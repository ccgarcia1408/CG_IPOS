-- Adds a top-level "Reports" module with one child menu per report page. All 28 reports reuse
-- the existing /api/dashboard/* endpoints (no new Stored Procedures) -- this migration only adds
-- navigation. Granted to Manager only (Administrator sees every menu through the existing
-- application rule and needs no explicit grant) except Audit Log, which stays Administrator-only
-- to match that endpoint's existing server-side 403 for non-admins (see dashboard.service.js /
-- getRecentActivity and the "Admin-only endpoint" comment on Dashboard Home.tsx).

INSERT INTO menus (ParentMenuId, Name, Icon, Path, Sorting, IsActive, CreatedAt)
VALUES (NULL, 'Reports', 'PieChartIcon', NULL, 10, 1, NOW());

INSERT INTO menus (ParentMenuId, Name, Icon, Path, Sorting, IsActive, CreatedAt)
SELECT MenuId, 'Sales Summary', 'DollarLineIcon', '/reports/sales-summary', 1, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Sales Trend', 'PieChartIcon', '/reports/sales-trend', 2, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Sales by Payment Method', 'DollarLineIcon', '/reports/sales-by-payment-method', 3, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Sales by Branch', 'GroupIcon', '/reports/sales-by-branch', 4, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Sales by Terminal', 'TableIcon', '/reports/sales-by-terminal', 5, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Top-Selling Products', 'ListIcon', '/reports/top-products', 6, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Top-Selling Categories', 'FolderIcon', '/reports/top-categories', 7, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Voided Sales', 'FileIcon', '/reports/voided-sales', 8, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Return Reasons', 'DocsIcon', '/reports/return-reasons', 9, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Top Returned Products', 'ListIcon', '/reports/top-returned-products', 10, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Sales Detail', 'TableIcon', '/reports/sales-detail', 11, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Inventory Summary', 'BoxCubeIcon', '/reports/inventory-summary', 12, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Low Stock Report', 'BoxIcon', '/reports/low-stock', 13, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Out of Stock Report', 'BoxIconLine', '/reports/out-of-stock', 14, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Expiring Products Report', 'CalenderIcon', '/reports/expiring-products', 15, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Stock Adjustment Summary', 'BoxCubeIcon', '/reports/stock-adjustment-summary', 16, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Stock Adjustment Detail', 'TableIcon', '/reports/stock-adjustment-detail', 17, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Purchasing Summary', 'DownloadIcon', '/reports/purchasing-summary', 18, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Pending Purchases', 'DownloadIcon', '/reports/pending-purchases', 19, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Supplier Purchase Summary', 'GroupIcon', '/reports/supplier-summary', 20, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Purchase Detail', 'TableIcon', '/reports/purchase-detail', 21, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Cashier Performance', 'UserCircleIcon', '/reports/cashier-performance', 22, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Active Shifts', 'TaskIcon', '/reports/active-shifts', 23, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Shift Closing Report', 'TaskIcon', '/reports/shift-closing', 24, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Terminal Status', 'GridIcon', '/reports/terminal-status', 25, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Official Receipt Summary', 'FileIcon', '/reports/official-receipt-summary', 26, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'OR Assignment Status', 'DocsIcon', '/reports/or-assignment-status', 27, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL
UNION ALL SELECT MenuId, 'Audit Log Report', 'PlugInIcon', '/reports/audit-log', 28, 1, NOW() FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL;

-- Grant the Reports parent + every child except Audit Log to Manager (RoleId 2). Administrator
-- (RoleId 1) needs no explicit grant -- sees every menu via the existing application rule.
INSERT INTO menu_roles (MenuId, RoleId)
SELECT m.MenuId, 2
FROM menus m
WHERE m.IsActive = 1
  AND m.IsDeleted = 0
  AND (
    (m.Name = 'Reports' AND m.ParentMenuId IS NULL)
    OR (m.ParentMenuId = (SELECT MenuId FROM menus WHERE Name = 'Reports' AND ParentMenuId IS NULL) AND m.Path <> '/reports/audit-log')
  );
