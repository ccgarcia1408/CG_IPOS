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

    -- Check if branch exists
    IF NOT EXISTS (
        SELECT 1
        FROM branches
        WHERE BranchId = p_BranchId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Branch not found.' AS Message;

    -- Check duplicate branch name (exclude current branch)
    ELSEIF EXISTS (
        SELECT 1
        FROM branches
        WHERE TRIM(Name) = TRIM(p_Name)
          AND BranchId <> p_BranchId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Branch name already exists.' AS Message;

    ELSE

        START TRANSACTION;

        -- Store old values
        SELECT JSON_OBJECT(
            'Name', Name,
            'Description', Description,
            'IsActive', IsActive
        )
        INTO v_OldValue
        FROM branches
        WHERE BranchId = p_BranchId;

        -- Update branch
        UPDATE branches
        SET
            Name = TRIM(p_Name),
            Description = p_Description,
            UpdatedAt = NOW(),
            UpdatedBy = p_UpdatedBy,
            IsActive = p_IsActive
        WHERE BranchId = p_BranchId
          AND IsDeleted = 0;

        -- Store new values
        SET v_NewValue = JSON_OBJECT(
            'Name', TRIM(p_Name),
            'Description', p_Description,
            'IsActive', p_IsActive
        );

        -- Audit log
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

    END IF;

END$$

DELIMITER ;