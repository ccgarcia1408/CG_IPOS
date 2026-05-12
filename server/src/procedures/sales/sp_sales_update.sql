DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sales_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sales_update`(
    IN p_SaleId INT,
    IN p_ORNo BIGINT,
    IN p_CashierId INT,
    IN p_Date DATETIME,
    IN p_SubTotal DECIMAL(18,2),
    IN p_Discount DECIMAL(18,2),
    IN p_Tax DECIMAL(18,2),
    IN p_Total DECIMAL(18,2),
    IN p_PaymentMethodId INT,
    IN p_AmountPaid DECIMAL(18,2),
    IN p_ChangeAmount DECIMAL(18,2),
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
            'Failed to update sale.' AS Message;
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
        'ChangeAmount', ChangeAmount
    )
    INTO v_OldValue
    FROM sales
    WHERE SaleId = p_SaleId;

    UPDATE sales
    SET
        ORNo = p_ORNo,
        CashierId = p_CashierId,
        DATE = p_Date,
        SubTotal = p_SubTotal,
        Discount = p_Discount,
        Tax = p_Tax,
        Total = p_Total,
        PaymentMethodId = p_PaymentMethodId,
        AmountPaid = p_AmountPaid,
        ChangeAmount = p_ChangeAmount,
        UpdatedAt = NOW(),
        UpdatedBy = p_UpdatedBy
    WHERE SaleId = p_SaleId
    AND IsDeleted = 0;

    -- NEW VALUE
    SET v_NewValue = JSON_OBJECT(
        'ORNo', p_ORNo,
        'CashierId', p_CashierId,
        'Date', p_Date,
        'SubTotal', p_SubTotal,
        'Discount', p_Discount,
        'Tax', p_Tax,
        'Total', p_Total,
        'PaymentMethodId', p_PaymentMethodId,
        'AmountPaid', p_AmountPaid,
        'ChangeAmount', p_ChangeAmount
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
        'Updated sale',
        'sales',
        p_SaleId,
        v_OldValue,
        v_NewValue,
        p_UpdatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Sale updated successfully.' AS Message;

END$$

DELIMITER ;