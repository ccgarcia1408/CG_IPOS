DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_branches_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_branches_create`(
    IN p_Name VARCHAR(255),
    IN p_Description TEXT,
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_BranchId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create branch.' AS Message;
    END;

    START TRANSACTION;

    INSERT INTO branches (
        NAME,
        Description,
        IsDeleted,
        CreatedAt,
        CreatedBy,
        IsActive
    )
    VALUES (
        p_Name,
        p_Description,
        0,
        NOW(),
        p_CreatedBy,
        1
    );

    SET v_BranchId = LAST_INSERT_ID();

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
        'Created branch',
        'branches',
        v_BranchId,
        NULL,
        JSON_OBJECT(
            'Name', p_Name,
            'Description', p_Description,
            'IsActive', 1
        ),
        p_CreatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Branch created successfully.' AS Message,
        v_BranchId AS BranchId;

END$$

DELIMITER ;