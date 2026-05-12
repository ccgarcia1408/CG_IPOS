DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_branches_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_branches_update`(
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
            'Failed to update branch.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'Name', NAME,
        'Description', Description,
        'IsActive', IsActive
    )
    INTO v_OldValue
    FROM branches
    WHERE BranchId = p_BranchId;

    UPDATE branches
    SET
        NAME = p_Name,
        Description = p_Description,
        UpdatedAt = NOW(),
        UpdatedBy = p_UpdatedBy,
        IsActive = p_IsActive
    WHERE BranchId = p_BranchId
    AND IsDeleted = 0;

    -- NEW VALUE
    SET v_NewValue = JSON_OBJECT(
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
        'Updated branch',
        'branches',
        p_BranchId,
        v_OldValue,
        v_NewValue,
        p_UpdatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Branch updated successfully.' AS Message;

END$$

DELIMITER ;