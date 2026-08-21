DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_payment_methods_delete`$$

-- Payment methods will be referenced by RESTRICT FK from sales (already present in the schema
-- ahead of Phase 5). "Delete" therefore deactivates rather than soft-deletes, matching
-- sp_products_delete's precedent.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_payment_methods_delete`(
    IN p_PaymentMethodId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to deactivate payment method.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'Name', NAME,
        'Description', Description,
        'IsActive', IsActive,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM payment_methods
    WHERE PaymentMethodId = p_PaymentMethodId;

    -- DEACTIVATE
    UPDATE payment_methods
    SET
        IsActive = 0,
        UpdatedAt = NOW(),
        UpdatedBy = p_DeletedBy
    WHERE PaymentMethodId = p_PaymentMethodId
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
        'UPDATE',
        'Deactivated payment method',
        'payment_methods',
        p_PaymentMethodId,
        v_OldValue,
        JSON_OBJECT(
            'IsActive', 0
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Payment method deactivated successfully.' AS Message;

END$$

DELIMITER ;
