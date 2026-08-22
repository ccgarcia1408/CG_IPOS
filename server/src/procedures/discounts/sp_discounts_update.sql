DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_discounts_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_discounts_update`(
    IN p_DiscountId INT,
    IN p_Name VARCHAR(100),
    IN p_Description VARCHAR(255),
    IN p_Type VARCHAR(20),
    IN p_Value DECIMAL(10,2),
    IN p_UpdatedBy INT,
    IN p_IsActive TINYINT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to update discount.' AS Message;
    END;

    IF NOT EXISTS (SELECT 1 FROM discounts WHERE DiscountId = p_DiscountId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Discount not found.' AS Message;
    ELSEIF p_Name IS NULL OR TRIM(p_Name) = '' THEN
        SELECT 0 AS Success, 'Discount name is required.' AS Message;
    ELSEIF p_Type NOT IN ('PERCENTAGE', 'FIXED') THEN
        SELECT 0 AS Success, 'Type must be PERCENTAGE or FIXED.' AS Message;
    ELSEIF p_Value IS NULL OR p_Value < 0 THEN
        SELECT 0 AS Success, 'Value must be a non-negative number.' AS Message;
    ELSEIF p_Type = 'PERCENTAGE' AND p_Value > 100 THEN
        SELECT 0 AS Success, 'A percentage discount cannot exceed 100.' AS Message;
    ELSEIF EXISTS (SELECT 1 FROM discounts WHERE TRIM(Name) = TRIM(p_Name) AND DiscountId <> p_DiscountId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Discount name already exists.' AS Message;
    ELSE
        START TRANSACTION;

        SELECT JSON_OBJECT('Name', Name, 'Type', `Type`, 'Value', Value, 'IsActive', IsActive)
        INTO v_OldValue
        FROM discounts WHERE DiscountId = p_DiscountId;

        UPDATE discounts
        SET Name = TRIM(p_Name), Description = p_Description, `Type` = p_Type, Value = p_Value,
            IsActive = p_IsActive, UpdatedAt = NOW(), UpdatedBy = p_UpdatedBy
        WHERE DiscountId = p_DiscountId AND IsDeleted = 0;

        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
        VALUES (
            'UPDATE', 'Updated discount', 'discounts', p_DiscountId,
            v_OldValue,
            JSON_OBJECT('Name', TRIM(p_Name), 'Type', p_Type, 'Value', p_Value, 'IsActive', p_IsActive),
            p_UpdatedBy
        );

        COMMIT;

        SELECT 1 AS Success, 'Discount updated successfully.' AS Message;
    END IF;

END$$

DELIMITER ;
