DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchase_items_delete`$$

-- Removes a line item from a still-pending purchase order and decrements the parent total to
-- match. Only allowed while the purchase is 'pending' — items on a received/cancelled order
-- are historical record.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchase_items_delete`(
    IN p_PurchaseItemId INT,
    IN p_DeletedBy INT
)
BEGIN
    DECLARE v_PurchaseId INT;
    DECLARE v_Status VARCHAR(20);
    DECLARE v_Total DECIMAL(18,2);
    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to remove purchase item.' AS Message;
    END;

    SELECT pi.PurchaseId, pi.Total, p.Status
    INTO v_PurchaseId, v_Total, v_Status
    FROM purchase_items pi
    INNER JOIN purchases p ON p.PurchaseId = pi.PurchaseId
    WHERE pi.PurchaseItemId = p_PurchaseItemId AND pi.IsDeleted = 0;

    IF v_PurchaseId IS NULL THEN
        SELECT 0 AS Success, 'Purchase item not found.' AS Message;
    ELSEIF v_Status <> 'pending' THEN
        SELECT 0 AS Success, 'Items can only be removed from a pending purchase order.' AS Message;
    ELSE
        START TRANSACTION;

        SELECT JSON_OBJECT('PurchaseId', v_PurchaseId, 'Total', v_Total) INTO v_OldValue;

        UPDATE purchase_items
        SET IsDeleted = 1, DeletedBy = p_DeletedBy, DateDeleted = NOW()
        WHERE PurchaseItemId = p_PurchaseItemId;

        UPDATE purchases
        SET TotalAmount = TotalAmount - v_Total
        WHERE PurchaseId = v_PurchaseId;

        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
        VALUES (
            'DELETE', 'Removed purchase item', 'purchase_items', p_PurchaseItemId,
            v_OldValue, JSON_OBJECT('IsDeleted', 1), p_DeletedBy
        );

        COMMIT;

        SELECT 1 AS Success, 'Purchase item removed successfully.' AS Message;
    END IF;
END$$

DELIMITER ;
