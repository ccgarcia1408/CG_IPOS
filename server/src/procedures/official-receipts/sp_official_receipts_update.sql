DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_official_receipts_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_official_receipts_update`(
    IN p_ORId INT,
    IN p_ORNo BIGINT,
    IN p_Status VARCHAR(100),
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
            'Failed to update official receipt.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'ORNo', ORNo,
        'Status', STATUS
    )
    INTO v_OldValue
    FROM official_receipts
    WHERE ORId = p_ORId;

    UPDATE official_receipts
    SET
        ORNo = p_ORNo,
        STATUS = p_Status,
        UpdatedAt = NOW(),
        UpdatedBy = p_UpdatedBy
    WHERE ORId = p_ORId
    AND IsDeleted = 0;

    -- NEW VALUE
    SET v_NewValue = JSON_OBJECT(
        'ORNo', p_ORNo,
        'Status', p_Status
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
        'Updated official receipt',
        'official_receipts',
        p_ORId,
        v_OldValue,
        v_NewValue,
        p_UpdatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Official receipt updated successfully.' AS Message;

END$$

DELIMITER ;