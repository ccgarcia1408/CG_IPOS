DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchases_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchases_create`(
    IN p_SupplierId INT,
    IN p_PurchaseDate DATETIME,
    IN p_TotalAmount DECIMAL(18,2),
    IN p_Status VARCHAR(100),
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_PurchaseId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create purchase.' AS Message;
    END;

    START TRANSACTION;

    INSERT INTO purchases (
        SupplierId,
        PurchaseDate,
        TotalAmount,
        STATUS,
        IsDeleted,
        CreatedAt,
        CreatedBy
    )
    VALUES (
        p_SupplierId,
        p_PurchaseDate,
        p_TotalAmount,
        p_Status,
        0,
        NOW(),
        p_CreatedBy
    );

    SET v_PurchaseId = LAST_INSERT_ID();

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
        'Created purchase',
        'purchases',
        v_PurchaseId,
        NULL,
        JSON_OBJECT(
            'SupplierId', p_SupplierId,
            'PurchaseDate', p_PurchaseDate,
            'TotalAmount', p_TotalAmount,
            'Status', p_Status
        ),
        p_CreatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Purchase created successfully.' AS Message,
        v_PurchaseId AS PurchaseId;

END$$

DELIMITER ;