DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_branches_delete`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_branches_delete`(
    IN p_BranchId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to delete branch.' AS Message;
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
    FROM branches
    WHERE BranchId = p_BranchId;

    -- SOFT DELETE
    UPDATE branches
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
    WHERE BranchId = p_BranchId
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
        'DELETE',
        'Deleted branch',
        'branches',
        p_BranchId,
        v_OldValue,
        JSON_OBJECT(
            'IsDeleted', 1
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Branch deleted successfully.' AS Message;

END$$

DELIMITER ;