DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sales_delete`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sales_delete`(
    IN p_SaleId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to delete sale.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'ORNo', ORNo,
        'CashierId', CashierId,
        'Date', DATE,
        'SubTotal', SubTotal,
        'Discount', Discount,
        'Tax', Tax,
        'Total', Total,
        'PaymentMethodId', PaymentMethodId,
        'AmountPaid', AmountPaid,
        'ChangeAmount', ChangeAmount,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM sales
    WHERE SaleId = p_SaleId;

    -- SOFT DELETE
    UPDATE sales
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
    WHERE SaleId = p_SaleId
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
        'Deleted sale',
        'sales',
        p_SaleId,
        v_OldValue,
        JSON_OBJECT(
            'IsDeleted', 1
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Sale deleted successfully.' AS Message;

END$$

DELIMITER ;