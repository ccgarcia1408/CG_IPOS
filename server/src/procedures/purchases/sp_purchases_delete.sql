DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchases_delete`$$

-- Removes a purchase order that was never received or cancelled — a pure data-entry mistake
-- with no real-world consequence yet. Only allowed while 'pending'; a received or cancelled
-- order is real business history and must be kept (soft-delete does not apply to those).
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchases_delete`(
    IN p_PurchaseId INT,
    IN p_DeletedBy INT
)
BEGIN
    DECLARE v_Status VARCHAR(20) DEFAULT NULL;
    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to delete purchase order.' AS Message;
    END;

    SELECT Status INTO v_Status FROM purchases WHERE PurchaseId = p_PurchaseId AND IsDeleted = 0;

    IF v_Status IS NULL THEN
        SELECT 0 AS Success, 'Purchase order not found.' AS Message;
    ELSEIF v_Status <> 'pending' THEN
        SELECT 0 AS Success, 'Only a pending purchase order can be deleted. Cancel it instead.' AS Message;
    ELSE
        START TRANSACTION;

        SELECT JSON_OBJECT('Status', Status, 'TotalAmount', TotalAmount) INTO v_OldValue
        FROM purchases WHERE PurchaseId = p_PurchaseId;

        UPDATE purchases
        SET IsDeleted = 1, DeletedBy = p_DeletedBy, DateDeleted = NOW()
        WHERE PurchaseId = p_PurchaseId;

        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
        VALUES ('DELETE', 'Deleted purchase order', 'purchases', p_PurchaseId, v_OldValue, JSON_OBJECT('IsDeleted', 1), p_DeletedBy);

        COMMIT;

        SELECT 1 AS Success, 'Purchase order deleted successfully.' AS Message;
    END IF;
END$$

DELIMITER ;
