DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_discounts_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_discounts_create`(
    IN p_Name VARCHAR(100),
    IN p_Description VARCHAR(255),
    IN p_Type VARCHAR(20),
    IN p_Value DECIMAL(10,2),
    IN p_IsDefault TINYINT,
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_DiscountId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to create discount.' AS Message;
    END;

    IF p_Name IS NULL OR TRIM(p_Name) = '' THEN
        SELECT 0 AS Success, 'Discount name is required.' AS Message;
    ELSEIF p_Type NOT IN ('PERCENTAGE', 'FIXED') THEN
        SELECT 0 AS Success, 'Type must be PERCENTAGE or FIXED.' AS Message;
    ELSEIF p_Value IS NULL OR p_Value < 0 THEN
        SELECT 0 AS Success, 'Value must be a non-negative number.' AS Message;
    ELSEIF p_Type = 'PERCENTAGE' AND p_Value > 100 THEN
        SELECT 0 AS Success, 'A percentage discount cannot exceed 100.' AS Message;
    ELSEIF EXISTS (SELECT 1 FROM discounts WHERE TRIM(Name) = TRIM(p_Name) AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Discount name already exists.' AS Message;
    ELSE
        START TRANSACTION;

        INSERT INTO discounts (Name, Description, `Type`, Value, IsDefault, IsDeleted, CreatedAt, CreatedBy, IsActive)
        VALUES (TRIM(p_Name), p_Description, p_Type, p_Value, IFNULL(p_IsDefault, 0), 0, NOW(), p_CreatedBy, 1);

        SET v_DiscountId = LAST_INSERT_ID();

        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
        VALUES (
            'CREATE', 'Created discount', 'discounts', v_DiscountId,
            NULL,
            JSON_OBJECT('Name', TRIM(p_Name), 'Type', p_Type, 'Value', p_Value, 'IsDefault', IFNULL(p_IsDefault, 0)),
            p_CreatedBy
        );

        COMMIT;

        SELECT 1 AS Success, 'Discount created successfully.' AS Message, v_DiscountId AS DiscountId;
    END IF;

END$$

DELIMITER ;
