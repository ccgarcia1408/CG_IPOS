-- sp_inventory_logs_create/_update/_delete were generic reference-data-style CRUD applied to a
-- movement ledger — never wired to any caller, and now reference the `Type` column dropped in
-- the previous migration (they would error if ever called). Superseded entirely by the atomic
-- Inventory Movement Engine (sp_inventory_receiveStock / deductStock / adjustStock), which is
-- the only legitimate write path to inventories/inventory_logs going forward.

DROP PROCEDURE IF EXISTS sp_inventory_logs_create;
DROP PROCEDURE IF EXISTS sp_inventory_logs_update;
DROP PROCEDURE IF EXISTS sp_inventory_logs_delete;
