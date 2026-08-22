DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_terminals_delete`$$

-- Terminals will be referenced by RESTRICT FK from sales (Phase 5). "Delete" therefore
-- deactivates rather than soft-deletes, matching sp_products_delete's precedent.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_terminals_delete`(
    IN p_TerminalId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to deactivate terminal.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'Name', NAME,
        'Description', Description,
        'IsActive', IsActive,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM terminals
    WHERE TerminalId = p_TerminalId;

    -- DEACTIVATE
    UPDATE terminals
    SET
        IsActive = 0,
        UpdatedAt = NOW(),
        UpdatedBy = p_DeletedBy
    WHERE TerminalId = p_TerminalId
    AND IsDeleted = 0;

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
        'Deactivated terminal',
        'terminals',
        p_TerminalId,
        v_OldValue,
        JSON_OBJECT(
            'IsActive', 0
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Terminal deactivated successfully.' AS Message;

END$$

DELIMITER ;
