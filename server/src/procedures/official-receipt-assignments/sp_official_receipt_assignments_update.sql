DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_official_receipt_assignments_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_official_receipt_assignments_update`(
    IN p_ORAssignmentId INT,
    IN p_ORFrom BIGINT,
    IN p_ORTo BIGINT,
    IN p_LastORUsed BIGINT,
    IN p_UserId INT,
    IN p_UpdatedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;
    DECLARE v_NewValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to update OR assignment.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'ORFrom', ORFrom,
        'ORTo', ORTo,
        'LastORUsed', LastORUsed,
        'UserId', UserId
    )
    INTO v_OldValue
    FROM official_receipt_assignments
    WHERE ORAssignmentId = p_ORAssignmentId;

    UPDATE official_receipt_assignments
    SET
        ORFrom = p_ORFrom,
        ORTo = p_ORTo,
        LastORUsed = p_LastORUsed,
        UserId = p_UserId,
        UpdatedAt = NOW(),
        UpdatedBy = p_UpdatedBy
    WHERE ORAssignmentId = p_ORAssignmentId
    AND IsDeleted = 0;

    -- NEW VALUE
    SET v_NewValue = JSON_OBJECT(
        'ORFrom', p_ORFrom,
        'ORTo', p_ORTo,
        'LastORUsed', p_LastORUsed,
        'UserId', p_UserId
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
        'Updated OR assignment',
        'official_receipt_assignments',
        p_ORAssignmentId,
        v_OldValue,
        v_NewValue,
        p_UpdatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'OR assignment updated successfully.' AS Message;

END$$

DELIMITER ;