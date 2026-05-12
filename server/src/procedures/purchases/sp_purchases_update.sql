DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchases_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchases_update`(
    IN p_PurchaseId INT,
    IN p_SupplierId INT,
    IN p_PurchaseDate DATETIME,
    IN p_TotalAmount DECIMAL(18,2),
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
            'Failed to update purchase.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'SupplierId', SupplierId,
        'PurchaseDate', PurchaseDate,
        'TotalAmount', TotalAmount,
        'Status', STATUS
    )
    INTO v_OldValue
    FROM purchases
    WHERE PurchaseId = p_PurchaseId;

    UPDATE purchases
    SET
        SupplierId = p_SupplierId,
        PurchaseDate = p_PurchaseDate,
        TotalAmount = p_TotalAmount,
        STATUS = p_Status,
        UpdatedAt = NOW(),
        UpdatedBy = p_UpdatedBy
    WHERE PurchaseId = p_PurchaseId
    AND IsDeleted = 0;

    -- NEW VALUE
    SET v_NewValue = JSON_OBJECT(
        'SupplierId', p_SupplierId,
        'PurchaseDate', p_PurchaseDate,
        'TotalAmount', p_TotalAmount,
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
        'Updated purchase',
        'purchases',
        p_PurchaseId,
        v_OldValue,
        v_NewValue,
        p_UpdatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Purchase updated successfully.' AS Message;

END$$

DELIMITER ;