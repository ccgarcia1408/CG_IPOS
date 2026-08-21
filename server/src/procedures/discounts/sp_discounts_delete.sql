DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_discounts_delete`$$

-- Deactivates rather than soft-deletes, matching branches/suppliers/etc: once discounts are
-- referenced by sales history, a true soft-delete would make it unfetchable by ID via getById.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_discounts_delete`(
    IN p_DiscountId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to deactivate discount.' AS Message;
    END;

    START TRANSACTION;

    SELECT JSON_OBJECT('Name', Name, 'Type', `Type`, 'Value', Value, 'IsActive', IsActive)
    INTO v_OldValue
    FROM discounts WHERE DiscountId = p_DiscountId;

    UPDATE discounts
    SET IsActive = 0, UpdatedAt = NOW(), UpdatedBy = p_DeletedBy
    WHERE DiscountId = p_DiscountId AND IsDeleted = 0;

    INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
    VALUES ('UPDATE', 'Deactivated discount', 'discounts', p_DiscountId, v_OldValue, JSON_OBJECT('IsActive', 0), p_DeletedBy);

    COMMIT;

    SELECT 1 AS Success, 'Discount deactivated successfully.' AS Message;

END$$

DELIMITER ;
