DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_official_receipt_assignments_create`$$

-- ORFrom/ORTo are VARCHAR to preserve leading-zero receipt-book formatting (e.g. '0000001').
-- The previous version declared these BIGINT, which silently stripped leading zeros before the
-- value ever reached the column. LastORUsed always starts NULL — a brand-new range has nothing
-- issued from it yet; it is never accepted as a creation input.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_official_receipt_assignments_create`(
    IN p_ORFrom VARCHAR(50),
    IN p_ORTo VARCHAR(50),
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

    IF p_ORFrom IS NULL OR p_ORTo IS NULL OR p_ORFrom NOT REGEXP '^[0-9]+$' OR p_ORTo NOT REGEXP '^[0-9]+$' THEN
        SELECT 0 AS Success, 'OR From and OR To must be numeric.' AS Message;
    ELSEIF CAST(p_ORFrom AS UNSIGNED) > CAST(p_ORTo AS UNSIGNED) THEN
        SELECT 0 AS Success, 'OR From must not be greater than OR To.' AS Message;
    ELSEIF NOT EXISTS (SELECT 1 FROM users WHERE UserId = p_UserId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'User not found.' AS Message;
    ELSE
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
            NULL,
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
                'UserId', p_UserId
            ),
            p_CreatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'OR assignment created successfully.' AS Message,
            v_ORAssignmentId AS ORAssignmentId;
    END IF;

END$$

DELIMITER ;
