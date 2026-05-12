DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_official_receipt_assignments_delete`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_official_receipt_assignments_delete`(
    IN p_ORAssignmentId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to delete OR assignment.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'ORFrom', ORFrom,
        'ORTo', ORTo,
        'LastORUsed', LastORUsed,
        'UserId', UserId,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM official_receipt_assignments
    WHERE ORAssignmentId = p_ORAssignmentId;

    -- SOFT DELETE
    UPDATE official_receipt_assignments
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
    WHERE ORAssignmentId = p_ORAssignmentId
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
        'Deleted OR assignment',
        'official_receipt_assignments',
        p_ORAssignmentId,
        v_OldValue,
        JSON_OBJECT(
            'IsDeleted', 1
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'OR assignment deleted successfully.' AS Message;

END$$

DELIMITER ;