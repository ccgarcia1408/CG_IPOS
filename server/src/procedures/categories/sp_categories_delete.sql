DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_categories_delete`$$

-- Categories are referenced by RESTRICT FK from products. getById filters on IsDeleted, so a
-- true soft-delete would make a category permanently unfetchable by ID once any product
-- references it. "Delete" therefore deactivates, matching sp_products_delete's precedent.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_categories_delete`(
    IN p_CategoryId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to deactivate category.' AS Message;
    END;

    START TRANSACTION;

    SELECT JSON_OBJECT(
        'BranchId', BranchId,
        'Name', Name,
        'Description', Description,
        'IsActive', IsActive,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM categories
    WHERE CategoryId = p_CategoryId;

    UPDATE categories
    SET
        IsActive = 0,
        UpdatedAt = NOW(),
        UpdatedBy = p_DeletedBy
    WHERE CategoryId = p_CategoryId
    AND IsDeleted = 0;

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
        'Deactivated category',
        'categories',
        p_CategoryId,
        v_OldValue,
        JSON_OBJECT(
            'IsActive', 0
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Category deactivated successfully.' AS Message;

END$$

DELIMITER ;
