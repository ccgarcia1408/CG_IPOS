DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_official_receipt_assignments_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_official_receipt_assignments_create`(
    IN p_ORFrom BIGINT,
    IN p_ORTo BIGINT,
    IN p_LastORUsed BIGINT,
    IN p_UserId INT,
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_ORAssignmentId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create OR assignment.' AS Message;
    END;

    START TRANSACTION;

    INSERT INTO official_receipt_assignments (
        ORFrom,
        ORTo,
        LastORUsed,
        UserId,
        IsDeleted,
        CreatedAt,
        CreatedBy
    )
    VALUES (
        p_ORFrom,
        p_ORTo,
        p_LastORUsed,
        p_UserId,
        0,
        NOW(),
        p_CreatedBy
    );

    SET v_ORAssignmentId = LAST_INSERT_ID();

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
        'Created OR assignment',
        'official_receipt_assignments',
        v_ORAssignmentId,
        NULL,
        JSON_OBJECT(
            'ORFrom', p_ORFrom,
            'ORTo', p_ORTo,
            'LastORUsed', p_LastORUsed,
            'UserId', p_UserId
        ),
        p_CreatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'OR assignment created successfully.' AS Message,
        v_ORAssignmentId AS ORAssignmentId;

END$$

DELIMITER ;