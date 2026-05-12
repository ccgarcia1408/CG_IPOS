DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_categories_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_categories_create`(
    IN p_BranchId INT,
    IN p_Name VARCHAR(255),
    IN p_Description TEXT,
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_CategoryId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create category.' AS Message;
    END;

    START TRANSACTION;

    INSERT INTO categories (
        BranchId,
        NAME,
        Description,
        IsDeleted,
        CreatedAt,
        CreatedBy,
        IsActive
    )
    VALUES (
        p_BranchId,
        p_Name,
        p_Description,
        0,
        NOW(),
        p_CreatedBy,
        1
    );

    SET v_CategoryId = LAST_INSERT_ID();

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
        'Created category',
        'categories',
        v_CategoryId,
        NULL,
        JSON_OBJECT(
            'BranchId', p_BranchId,
            'Name', p_Name,
            'Description', p_Description,
            'IsActive', 1
        ),
        p_CreatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Category created successfully.' AS Message,
        v_CategoryId AS CategoryId;

END$$

DELIMITER ;