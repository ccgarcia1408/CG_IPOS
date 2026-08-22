DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_inventory_receiveStock`$$

-- Increases a branch's stock for a product and records the movement, atomically.
-- Used by: Purchasing (receiving), Sales void/return (restoring stock), manual opening balances.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_inventory_receiveStock`(
    IN p_BranchId INT,
    IN p_ProductId INT,
    IN p_Quantity INT,
    IN p_ReferenceType VARCHAR(64),
    IN p_ReferenceId INT,
    IN p_Remarks VARCHAR(255),
    IN p_CreatedBy INT
)
BEGIN
    DECLARE v_StockBefore INT DEFAULT 0;
    DECLARE v_StockAfter INT DEFAULT 0;
    DECLARE v_InventoryLogId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to receive stock.' AS Message, NULL AS InventoryLogId;
    END;

    IF p_Quantity IS NULL OR p_Quantity <= 0 THEN
        SELECT 0 AS Success, 'Quantity must be a positive whole number.' AS Message, NULL AS InventoryLogId;
    ELSEIF NOT EXISTS (SELECT 1 FROM branches WHERE BranchId = p_BranchId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Branch not found.' AS Message, NULL AS InventoryLogId;
    ELSEIF NOT EXISTS (SELECT 1 FROM products WHERE ProductId = p_ProductId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Product not found.' AS Message, NULL AS InventoryLogId;
    ELSE
        START TRANSACTION;

        -- Ensure the branch/product inventory row exists, then lock it for the update.
        INSERT INTO inventories (BranchId, ProductId, Quantity, MinimumStock)
        VALUES (p_BranchId, p_ProductId, 0, 0)
        ON DUPLICATE KEY UPDATE InventoryId = InventoryId;

        SELECT Quantity INTO v_StockBefore
        FROM inventories
        WHERE BranchId = p_BranchId AND ProductId = p_ProductId
        FOR UPDATE;

        SET v_StockAfter = v_StockBefore + p_Quantity;

        UPDATE inventories
        SET Quantity = v_StockAfter
        WHERE BranchId = p_BranchId AND ProductId = p_ProductId;

        INSERT INTO inventory_logs (
            BranchId, ProductId, TransactionType, ReferenceType, ReferenceId,
            Remarks, Quantity, StockBefore, StockAfter, IsDeleted, CreatedAt, CreatedBy
        )
        VALUES (
            p_BranchId, p_ProductId, 'RECEIVE', p_ReferenceType, p_ReferenceId,
            p_Remarks, p_Quantity, v_StockBefore, v_StockAfter, 0, NOW(), p_CreatedBy
        );

        SET v_InventoryLogId = LAST_INSERT_ID();

        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
        VALUES (
            'CREATE', 'Received stock', 'inventory_logs', v_InventoryLogId,
            JSON_OBJECT('Quantity', v_StockBefore),
            JSON_OBJECT('BranchId', p_BranchId, 'ProductId', p_ProductId, 'ReferenceType', p_ReferenceType, 'ReferenceId', p_ReferenceId, 'Quantity', p_Quantity, 'StockAfter', v_StockAfter),
            p_CreatedBy
        );

        COMMIT;

        SELECT 1 AS Success, 'Stock received successfully.' AS Message, v_InventoryLogId AS InventoryLogId, v_StockAfter AS StockAfter;
    END IF;
END$$

DELIMITER ;
