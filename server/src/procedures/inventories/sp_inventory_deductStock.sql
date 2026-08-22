DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_inventory_deductStock`$$

-- Decreases a branch's stock for a product and records the movement, atomically.
-- Refuses to deduct below zero. Used by: Sales (checkout), stock transfer-out.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_inventory_deductStock`(
    IN p_BranchId INT,
    IN p_ProductId INT,
    IN p_Quantity INT,
    IN p_ReferenceType VARCHAR(64),
    IN p_ReferenceId INT,
    IN p_Remarks VARCHAR(255),
    IN p_CreatedBy INT
)
BEGIN
    DECLARE v_StockBefore INT DEFAULT NULL;
    DECLARE v_StockAfter INT DEFAULT 0;
    DECLARE v_InventoryLogId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to deduct stock.' AS Message, NULL AS InventoryLogId;
    END;

    IF p_Quantity IS NULL OR p_Quantity <= 0 THEN
        SELECT 0 AS Success, 'Quantity must be a positive whole number.' AS Message, NULL AS InventoryLogId;
    ELSE
        START TRANSACTION;

        SELECT Quantity INTO v_StockBefore
        FROM inventories
        WHERE BranchId = p_BranchId AND ProductId = p_ProductId
        FOR UPDATE;

        IF v_StockBefore IS NULL THEN
            ROLLBACK;
            SELECT 0 AS Success, 'No inventory record for this product at this branch.' AS Message, NULL AS InventoryLogId;
        ELSEIF v_StockBefore < p_Quantity THEN
            ROLLBACK;
            SELECT 0 AS Success, CONCAT('Insufficient stock. Available: ', v_StockBefore, ', requested: ', p_Quantity, '.') AS Message, NULL AS InventoryLogId;
        ELSE
            SET v_StockAfter = v_StockBefore - p_Quantity;

            UPDATE inventories
            SET Quantity = v_StockAfter
            WHERE BranchId = p_BranchId AND ProductId = p_ProductId;

            INSERT INTO inventory_logs (
                BranchId, ProductId, TransactionType, ReferenceType, ReferenceId,
                Remarks, Quantity, StockBefore, StockAfter, IsDeleted, CreatedAt, CreatedBy
            )
            VALUES (
                p_BranchId, p_ProductId, 'DEDUCT', p_ReferenceType, p_ReferenceId,
                p_Remarks, p_Quantity, v_StockBefore, v_StockAfter, 0, NOW(), p_CreatedBy
            );

            SET v_InventoryLogId = LAST_INSERT_ID();

            INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
            VALUES (
                'UPDATE', 'Deducted stock', 'inventory_logs', v_InventoryLogId,
                JSON_OBJECT('Quantity', v_StockBefore),
                JSON_OBJECT('BranchId', p_BranchId, 'ProductId', p_ProductId, 'ReferenceType', p_ReferenceType, 'ReferenceId', p_ReferenceId, 'Quantity', p_Quantity, 'StockAfter', v_StockAfter),
                p_CreatedBy
            );

            COMMIT;

            SELECT 1 AS Success, 'Stock deducted successfully.' AS Message, v_InventoryLogId AS InventoryLogId, v_StockAfter AS StockAfter;
        END IF;
    END IF;
END$$

DELIMITER ;
