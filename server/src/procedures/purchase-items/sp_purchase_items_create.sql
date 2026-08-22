DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchase_items_create`$$

-- Adds a line item to a still-pending purchase order. Total is computed server-side (never
-- trusted from the client) and the parent purchases.TotalAmount is kept in sync atomically,
-- so it never drifts from the sum of its items. Only allowed while the purchase is 'pending' —
-- once received or cancelled, its items are historical record and must not change.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchase_items_create`(
    IN p_PurchaseId INT,
    IN p_ProductId INT,
    IN p_Quantity INT,
    IN p_CostPrice DECIMAL(18,2),
    IN p_CreatedBy INT
)
BEGIN
    DECLARE v_Status VARCHAR(20) DEFAULT NULL;
    DECLARE v_Total DECIMAL(18,2);
    DECLARE v_PurchaseItemId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to add purchase item.' AS Message, NULL AS PurchaseItemId;
    END;

    SELECT Status INTO v_Status FROM purchases WHERE PurchaseId = p_PurchaseId AND IsDeleted = 0;

    IF v_Status IS NULL THEN
        SELECT 0 AS Success, 'Purchase order not found.' AS Message, NULL AS PurchaseItemId;
    ELSEIF v_Status <> 'pending' THEN
        SELECT 0 AS Success, 'Items can only be added to a pending purchase order.' AS Message, NULL AS PurchaseItemId;
    ELSEIF p_Quantity IS NULL OR p_Quantity <= 0 THEN
        SELECT 0 AS Success, 'Quantity must be a positive whole number.' AS Message, NULL AS PurchaseItemId;
    ELSEIF p_CostPrice IS NULL OR p_CostPrice < 0 THEN
        SELECT 0 AS Success, 'Cost price must be a non-negative number.' AS Message, NULL AS PurchaseItemId;
    ELSEIF NOT EXISTS (SELECT 1 FROM products WHERE ProductId = p_ProductId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Product not found.' AS Message, NULL AS PurchaseItemId;
    ELSE
        SET v_Total = p_Quantity * p_CostPrice;

        START TRANSACTION;

        INSERT INTO purchase_items (
            PurchaseId, ProductId, Quantity, CostPrice, Total, IsDeleted, CreatedAt, CreatedBy
        )
        VALUES (
            p_PurchaseId, p_ProductId, p_Quantity, p_CostPrice, v_Total, 0, NOW(), p_CreatedBy
        );

        SET v_PurchaseItemId = LAST_INSERT_ID();

        UPDATE purchases
        SET TotalAmount = TotalAmount + v_Total
        WHERE PurchaseId = p_PurchaseId;

        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
        VALUES (
            'CREATE', 'Added purchase item', 'purchase_items', v_PurchaseItemId,
            NULL,
            JSON_OBJECT('PurchaseId', p_PurchaseId, 'ProductId', p_ProductId, 'Quantity', p_Quantity, 'CostPrice', p_CostPrice, 'Total', v_Total),
            p_CreatedBy
        );

        COMMIT;

        SELECT 1 AS Success, 'Purchase item added successfully.' AS Message, v_PurchaseItemId AS PurchaseItemId, v_Total AS Total;
    END IF;
END$$

DELIMITER ;
