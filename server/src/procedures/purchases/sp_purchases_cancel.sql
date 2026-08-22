DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchases_cancel`$$

-- Cancels a pending purchase order. No inventory effect — nothing was ever received. One-way
-- transition (pending -> cancelled only); a cancelled or received order cannot be re-cancelled.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchases_cancel`(
    IN p_PurchaseId INT,
    IN p_Reason VARCHAR(255),
    IN p_CancelledBy INT
)
BEGIN
    DECLARE v_Status VARCHAR(20) DEFAULT NULL;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to cancel purchase.' AS Message;
    END;

    SELECT Status INTO v_Status FROM purchases WHERE PurchaseId = p_PurchaseId AND IsDeleted = 0;

    IF v_Status IS NULL THEN
        SELECT 0 AS Success, 'Purchase order not found.' AS Message;
    ELSEIF v_Status <> 'pending' THEN
        SELECT 0 AS Success, CONCAT('Purchase order is already ', v_Status, '.') AS Message;
    ELSEIF p_Reason IS NULL OR TRIM(p_Reason) = '' THEN
        SELECT 0 AS Success, 'A reason is required to cancel a purchase order.' AS Message;
    ELSE
        START TRANSACTION;

        UPDATE purchases
        SET Status = 'cancelled', CancelReason = p_Reason, CancelledBy = p_CancelledBy, DateCancelled = NOW(),
            UpdatedAt = NOW(), UpdatedBy = p_CancelledBy
        WHERE PurchaseId = p_PurchaseId;

        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
        VALUES (
            'UPDATE', 'Cancelled purchase order', 'purchases', p_PurchaseId,
            JSON_OBJECT('Status', 'pending'), JSON_OBJECT('Status', 'cancelled', 'CancelReason', p_Reason), p_CancelledBy
        );

        COMMIT;

        SELECT 1 AS Success, 'Purchase order cancelled successfully.' AS Message;
    END IF;
END$$

DELIMITER ;
