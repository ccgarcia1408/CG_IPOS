DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_terminals_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_terminals_update`(
    IN p_TerminalId INT,
    IN p_BranchId INT,
    IN p_Name VARCHAR(255),
    IN p_Description TEXT,
    IN p_UpdatedBy INT,
    IN p_IsActive TINYINT
)
BEGIN

    DECLARE v_OldValue JSON;
    DECLARE v_NewValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to update terminal.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'BranchId', BranchId,
        'Name', `Name`,
        'Description', Description,
        'IsActive', IsActive
    )
    INTO v_OldValue
    FROM terminals
    WHERE TerminalId = p_TerminalId;

    UPDATE terminals
    SET
        BranchId = p_BranchId,
        `Name` = p_Name,
        Description = p_Description,
        UpdatedAt = NOW(),
        UpdatedBy = p_UpdatedBy,
        IsActive = p_IsActive
    WHERE TerminalId = p_TerminalId
    AND IsDeleted = 0;

    -- NEW VALUE
    SET v_NewValue = JSON_OBJECT(
        'BranchId', p_BranchId,
        'Name', p_Name,
        'Description', p_Description,
        'IsActive', p_IsActive
    );

    -- AUDIT LOG
    INSERT INTO audit_logs (
        ActionType,
        `Action`,
        TableName,
        RecordId,
        OldValue,
        NewValue,
        CreatedBy
    )
    VALUES (
        'UPDATE',
        'Updated terminal',
        'terminals',
        p_TerminalId,
        v_OldValue,
        v_NewValue,
        p_UpdatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Terminal updated successfully.' AS Message;

END$$

DELIMITER ;