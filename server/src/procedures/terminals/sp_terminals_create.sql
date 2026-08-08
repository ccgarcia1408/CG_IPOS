DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_terminals_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_terminals_create`(
    IN p_BranchId INT,
    IN p_Name VARCHAR(255),
    IN p_Description TEXT,
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_TerminalId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create terminal.' AS Message;
    END;

    START TRANSACTION;

    INSERT INTO terminals (
        BranchId,
        `Name`,
        Description,
        IsDeleted,
        CreatedAt,
        CreatedBy,
        IsActive
    )
    VALUES (
        p_BranchId,
        p_Name,
        p_Description,
        0,
        NOW(),
        p_CreatedBy,
        1
    );

    SET v_TerminalId = LAST_INSERT_ID();

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
        'CREATE',
        'Created terminal',
        'terminals',
        v_TerminalId,
        NULL,
        JSON_OBJECT(
            'BranchId', p_BranchId,
            'Name', p_Name,
            'Description', p_Description,
            'IsActive', 1
        ),
        p_CreatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Terminal created successfully.' AS Message,
        v_TerminalId AS TerminalId;

END$$

DELIMITER ;