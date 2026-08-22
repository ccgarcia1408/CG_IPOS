DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_taxes_delete`$$

-- Deactivates rather than soft-deletes, matching branches/suppliers/etc.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_taxes_delete`(
    IN p_TaxId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to deactivate tax.' AS Message;
    END;

    START TRANSACTION;

    SELECT JSON_OBJECT('Name', Name, 'Rate', Rate, 'IsActive', IsActive)
    INTO v_OldValue
    FROM taxes WHERE TaxId = p_TaxId;

    UPDATE taxes
    SET IsActive = 0, UpdatedAt = NOW(), UpdatedBy = p_DeletedBy
    WHERE TaxId = p_TaxId AND IsDeleted = 0;

    INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
    VALUES ('UPDATE', 'Deactivated tax', 'taxes', p_TaxId, v_OldValue, JSON_OBJECT('IsActive', 0), p_DeletedBy);

    COMMIT;

    SELECT 1 AS Success, 'Tax deactivated successfully.' AS Message;

END$$

DELIMITER ;
