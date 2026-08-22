DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_taxes_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_taxes_update`(
    IN p_TaxId INT,
    IN p_Name VARCHAR(100),
    IN p_Description VARCHAR(255),
    IN p_Rate DECIMAL(5,2),
    IN p_UpdatedBy INT,
    IN p_IsActive TINYINT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to update tax.' AS Message;
    END;

    IF NOT EXISTS (SELECT 1 FROM taxes WHERE TaxId = p_TaxId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Tax not found.' AS Message;
    ELSEIF p_Name IS NULL OR TRIM(p_Name) = '' THEN
        SELECT 0 AS Success, 'Tax name is required.' AS Message;
    ELSEIF p_Rate IS NULL OR p_Rate < 0 OR p_Rate > 100 THEN
        SELECT 0 AS Success, 'Rate must be between 0 and 100.' AS Message;
    ELSEIF EXISTS (SELECT 1 FROM taxes WHERE TRIM(Name) = TRIM(p_Name) AND TaxId <> p_TaxId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Tax name already exists.' AS Message;
    ELSE
        START TRANSACTION;

        SELECT JSON_OBJECT('Name', Name, 'Rate', Rate, 'IsActive', IsActive)
        INTO v_OldValue
        FROM taxes WHERE TaxId = p_TaxId;

        UPDATE taxes
        SET Name = TRIM(p_Name), Description = p_Description, Rate = p_Rate,
            IsActive = p_IsActive, UpdatedAt = NOW(), UpdatedBy = p_UpdatedBy
        WHERE TaxId = p_TaxId AND IsDeleted = 0;

        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
        VALUES (
            'UPDATE', 'Updated tax', 'taxes', p_TaxId,
            v_OldValue,
            JSON_OBJECT('Name', TRIM(p_Name), 'Rate', p_Rate, 'IsActive', p_IsActive),
            p_UpdatedBy
        );

        COMMIT;

        SELECT 1 AS Success, 'Tax updated successfully.' AS Message;
    END IF;

END$$

DELIMITER ;
