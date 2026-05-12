DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchases_delete`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchases_delete`(
    IN p_PurchaseId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to delete purchase.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'SupplierId', SupplierId,
        'PurchaseDate', PurchaseDate,
        'TotalAmount', TotalAmount,
        'Status', STATUS,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM purchases
    WHERE PurchaseId = p_PurchaseId;

    -- SOFT DELETE
    UPDATE purchases
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
    WHERE PurchaseId = p_PurchaseId
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
        'Deleted purchase',
        'purchases',
        p_PurchaseId,
        v_OldValue,
        JSON_OBJECT(
            'IsDeleted', 1
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Purchase deleted successfully.' AS Message;

END$$

DELIMITER ;