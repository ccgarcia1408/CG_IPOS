DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_official_receipt_assignments_update`$$

-- Reassigns a range to a different cashier and/or extends its upper bound (ORTo). ORFrom and
-- LastORUsed are deliberately not editable here — rewriting either after numbers may already
-- have been issued against this range would desync it from the official_receipts rows already
-- tied to it. To shrink or replace a range, create a new assignment instead.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_official_receipt_assignments_update`(
    IN p_ORAssignmentId INT,
    IN p_ORTo VARCHAR(50),
    IN p_UserId INT,
    IN p_UpdatedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;
    DECLARE v_NewValue JSON;
    DECLARE v_ORFrom VARCHAR(50);
    DECLARE v_LastORUsed VARCHAR(50);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to update OR assignment.' AS Message;
    END;

    SELECT ORFrom, LastORUsed INTO v_ORFrom, v_LastORUsed
    FROM official_receipt_assignments
    WHERE ORAssignmentId = p_ORAssignmentId AND IsDeleted = 0;

    IF v_ORFrom IS NULL THEN
        SELECT 0 AS Success, 'OR assignment not found.' AS Message;
    ELSEIF p_ORTo IS NULL OR p_ORTo NOT REGEXP '^[0-9]+$' THEN
        SELECT 0 AS Success, 'OR To must be numeric.' AS Message;
    ELSEIF CAST(p_ORTo AS UNSIGNED) < CAST(v_ORFrom AS UNSIGNED)
        OR (v_LastORUsed IS NOT NULL AND CAST(p_ORTo AS UNSIGNED) < CAST(v_LastORUsed AS UNSIGNED)) THEN
        SELECT 0 AS Success, 'OR To cannot be less than OR From or the last number already issued.' AS Message;
    ELSEIF NOT EXISTS (SELECT 1 FROM users WHERE UserId = p_UserId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'User not found.' AS Message;
    ELSE
        START TRANSACTION;

        SELECT JSON_OBJECT('ORTo', ORTo, 'UserId', UserId)
        INTO v_OldValue
        FROM official_receipt_assignments
        WHERE ORAssignmentId = p_ORAssignmentId;

        UPDATE official_receipt_assignments
        SET
            ORTo = p_ORTo,
            UserId = p_UserId,
            UpdatedAt = NOW(),
            UpdatedBy = p_UpdatedBy
        WHERE ORAssignmentId = p_ORAssignmentId
        AND IsDeleted = 0;

        SET v_NewValue = JSON_OBJECT('ORTo', p_ORTo, 'UserId', p_UserId);

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
    END IF;

END$$

DELIMITER ;
