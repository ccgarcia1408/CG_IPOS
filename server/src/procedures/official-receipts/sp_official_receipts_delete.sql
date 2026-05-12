DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_official_receipts_delete`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_official_receipts_delete`(
    IN p_ORId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to delete official receipt.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'ORNo', ORNo,
        'Status', STATUS,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM official_receipts
    WHERE ORId = p_ORId;

    -- SOFT DELETE
    UPDATE official_receipts
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
    WHERE ORId = p_ORId
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
        'Deleted official receipt',
        'official_receipts',
        p_ORId,
        v_OldValue,
        JSON_OBJECT(
            'IsDeleted', 1
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Official receipt deleted successfully.' AS Message;

END$$

DELIMITER ;