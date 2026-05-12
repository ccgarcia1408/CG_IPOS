DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_payment_methods_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_payment_methods_create`(
    IN p_Name VARCHAR(255),
    IN p_Description TEXT,
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_PaymentMethodId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create payment method.' AS Message;
    END;

    START TRANSACTION;

    INSERT INTO payment_methods (
        NAME,
        Description,
        IsDeleted,
        CreatedAt,
        CreatedBy,
        IsActive
    )
    VALUES (
        p_Name,
        p_Description,
        0,
        NOW(),
        p_CreatedBy,
        1
    );

    SET v_PaymentMethodId = LAST_INSERT_ID();

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
        'Created payment method',
        'payment_methods',
        v_PaymentMethodId,
        NULL,
        JSON_OBJECT(
            'Name', p_Name,
            'Description', p_Description,
            'IsActive', 1
        ),
        p_CreatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Payment method created successfully.' AS Message,
        v_PaymentMethodId AS PaymentMethodId;

END$$

DELIMITER ;