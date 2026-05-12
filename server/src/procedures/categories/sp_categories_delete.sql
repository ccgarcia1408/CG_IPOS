DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_categories_delete`$$

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
            'Failed to delete category.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
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

    -- SOFT DELETE
    UPDATE categories
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
    WHERE CategoryId = p_CategoryId
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
        'Deleted category',
        'categories',
        p_CategoryId,
        v_OldValue,
        JSON_OBJECT(
            'IsDeleted', 1
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Category deleted successfully.' AS Message;

END$$

DELIMITER ;