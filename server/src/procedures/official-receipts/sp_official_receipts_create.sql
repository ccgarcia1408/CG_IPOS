DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_official_receipts_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_official_receipts_create`(
    IN p_ORNo BIGINT,
    IN p_Status VARCHAR(100),
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_ORId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create official receipt.' AS Message;
    END;

    START TRANSACTION;

    INSERT INTO official_receipts (
        ORNo,
        STATUS,
        IsDeleted,
        CreatedAt,
        CreatedBy
    )
    VALUES (
        p_ORNo,
        p_Status,
        0,
        NOW(),
        p_CreatedBy
    );

    SET v_ORId = LAST_INSERT_ID();

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
        'Created official receipt',
        'official_receipts',
        v_ORId,
        NULL,
        JSON_OBJECT(
            'ORNo', p_ORNo,
            'Status', p_Status
        ),
        p_CreatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Official receipt created successfully.' AS Message,
        v_ORId AS ORId;

END$$

DELIMITER ;