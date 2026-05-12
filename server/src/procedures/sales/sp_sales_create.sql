DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sales_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sales_create`(
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
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_SaleId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create sale.' AS Message;
    END;

    START TRANSACTION;

    INSERT INTO sales (
        ORNo,
        CashierId,
        DATE,
        SubTotal,
        Discount,
        Tax,
        Total,
        PaymentMethodId,
        AmountPaid,
        ChangeAmount,
        IsCancelled,
        IsDeleted,
        CreatedAt,
        CreatedBy
    )
    VALUES (
        p_ORNo,
        p_CashierId,
        p_Date,
        p_SubTotal,
        p_Discount,
        p_Tax,
        p_Total,
        p_PaymentMethodId,
        p_AmountPaid,
        p_ChangeAmount,
        0,
        0,
        NOW(),
        p_CreatedBy
    );

    SET v_SaleId = LAST_INSERT_ID();

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
        'Created sale',
        'sales',
        v_SaleId,
        NULL,
        JSON_OBJECT(
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
        ),
        p_CreatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Sale created successfully.' AS Message,
        v_SaleId AS SaleId;

END$$

DELIMITER ;