DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_inventory_adjustStock`$$

-- Sets a branch's stock for a product to an explicit physical-count value (a stocktake
-- correction), recording the delta as a movement. A reason is mandatory since this bypasses
-- the normal receive/deduct flow. Used by: manual inventory adjustments.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_inventory_adjustStock`(
    IN p_BranchId INT,
    IN p_ProductId INT,
    IN p_NewQuantity INT,
    IN p_Reason VARCHAR(255),
    IN p_CreatedBy INT
)
BEGIN
    DECLARE v_StockBefore INT DEFAULT NULL;
    DECLARE v_Delta INT DEFAULT 0;
    DECLARE v_InventoryLogId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to adjust stock.' AS Message, NULL AS InventoryLogId;
    END;

    IF p_NewQuantity IS NULL OR p_NewQuantity < 0 THEN
        SELECT 0 AS Success, 'New quantity must be a non-negative whole number.' AS Message, NULL AS InventoryLogId;
    ELSEIF p_Reason IS NULL OR TRIM(p_Reason) = '' THEN
        SELECT 0 AS Success, 'A reason is required for a manual stock adjustment.' AS Message, NULL AS InventoryLogId;
    ELSEIF NOT EXISTS (SELECT 1 FROM branches WHERE BranchId = p_BranchId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Branch not found.' AS Message, NULL AS InventoryLogId;
    ELSEIF NOT EXISTS (SELECT 1 FROM products WHERE ProductId = p_ProductId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Product not found.' AS Message, NULL AS InventoryLogId;
    ELSE
        START TRANSACTION;

        INSERT INTO inventories (BranchId, ProductId, Quantity, MinimumStock)
        VALUES (p_BranchId, p_ProductId, 0, 0)
        ON DUPLICATE KEY UPDATE InventoryId = InventoryId;

        SELECT Quantity INTO v_StockBefore
        FROM inventories
        WHERE BranchId = p_BranchId AND ProductId = p_ProductId
        FOR UPDATE;

        SET v_Delta = p_NewQuantity - v_StockBefore;

        UPDATE inventories
        SET Quantity = p_NewQuantity
        WHERE BranchId = p_BranchId AND ProductId = p_ProductId;

        INSERT INTO inventory_logs (
            BranchId, ProductId, TransactionType, ReferenceType, ReferenceId,
            Remarks, Quantity, StockBefore, StockAfter, IsDeleted, CreatedAt, CreatedBy
        )
        VALUES (
            p_BranchId, p_ProductId, 'ADJUSTMENT', 'MANUAL_ADJUSTMENT', NULL,
            p_Reason, v_Delta, v_StockBefore, p_NewQuantity, 0, NOW(), p_CreatedBy
        );

        SET v_InventoryLogId = LAST_INSERT_ID();

        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
        VALUES (
            'UPDATE', 'Adjusted stock', 'inventory_logs', v_InventoryLogId,
            JSON_OBJECT('Quantity', v_StockBefore),
            JSON_OBJECT('BranchId', p_BranchId, 'ProductId', p_ProductId, 'Reason', p_Reason, 'Delta', v_Delta, 'StockAfter', p_NewQuantity),
            p_CreatedBy
        );

        COMMIT;

        SELECT 1 AS Success, 'Stock adjusted successfully.' AS Message, v_InventoryLogId AS InventoryLogId, p_NewQuantity AS StockAfter;
    END IF;
END$$

DELIMITER ;
