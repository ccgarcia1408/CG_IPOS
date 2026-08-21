-- sp_sales_create/_update/_delete and sp_sale_items_create/_update/_delete/_getAll/_getById were
-- generic reference-data-style CRUD applied to a POS transaction — no items linkage, no
-- inventory effect, no OR issuance, and (for sales) no delete capability should ever exist for
-- a completed financial transaction (only void). Superseded entirely by sp_sales_completeSale /
-- sp_sales_void / sp_sales_return and sp_sale_items_getBySaleId.

DROP PROCEDURE IF EXISTS sp_sales_create;
DROP PROCEDURE IF EXISTS sp_sales_update;
DROP PROCEDURE IF EXISTS sp_sales_delete;
DROP PROCEDURE IF EXISTS sp_sale_items_create;
DROP PROCEDURE IF EXISTS sp_sale_items_update;
DROP PROCEDURE IF EXISTS sp_sale_items_delete;
DROP PROCEDURE IF EXISTS sp_sale_items_getAll;
DROP PROCEDURE IF EXISTS sp_sale_items_getById;
