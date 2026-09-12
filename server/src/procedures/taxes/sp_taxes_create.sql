DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_taxes_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_taxes_create`(
    IN p_Name VARCHAR(100),
    IN p_Description VARCHAR(255),
    IN p_Rate DECIMAL(5,2),
    IN p_IsDefault TINYINT,
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_TaxId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to create tax.' AS Message;
    END;

    IF p_Name IS NULL OR TRIM(p_Name) = '' THEN
        SELECT 0 AS Success, 'Tax name is required.' AS Message;
    ELSEIF p_Rate IS NULL OR p_Rate < 0 OR p_Rate > 100 THEN
        SELECT 0 AS Success, 'Rate must be between 0 and 100.' AS Message;
    ELSEIF EXISTS (SELECT 1 FROM taxes WHERE TRIM(Name) = TRIM(p_Name) AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Tax name already exists.' AS Message;
    ELSE
        START TRANSACTION;

        INSERT INTO taxes (Name, Description, Rate, IsDefault, IsDeleted, CreatedAt, CreatedBy, IsActive)
        VALUES (TRIM(p_Name), p_Description, p_Rate, IFNULL(p_IsDefault, 0), 0, NOW(), p_CreatedBy, 1);

        SET v_TaxId = LAST_INSERT_ID();

        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
        VALUES (
            'CREATE', 'Created tax', 'taxes', v_TaxId,
            NULL,
            JSON_OBJECT('Name', TRIM(p_Name), 'Rate', p_Rate, 'IsDefault', IFNULL(p_IsDefault, 0)),
            p_CreatedBy
        );

        COMMIT;

        SELECT 1 AS Success, 'Tax created successfully.' AS Message, v_TaxId AS TaxId;
    END IF;

END$$

DELIMITER ;
