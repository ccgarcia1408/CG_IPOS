DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_branches_delete`$$

-- Branches are referenced by RESTRICT FKs from terminals, categories, inventories,
-- inventory_logs, and (from Phase 4 on) purchases/sales. getById filters on IsDeleted, so a
-- true soft-delete would make a branch permanently unfetchable by ID once anything historical
-- references it. "Delete" therefore deactivates, matching sp_products_delete's precedent.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_branches_delete`(
    IN p_BranchId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to deactivate branch.' AS Message;
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
    FROM branches
    WHERE BranchId = p_BranchId;

    -- DEACTIVATE
    UPDATE branches
    SET
        IsActive = 0,
        UpdatedAt = NOW(),
        UpdatedBy = p_DeletedBy
    WHERE BranchId = p_BranchId
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
        'Deactivated branch',
        'branches',
        p_BranchId,
        v_OldValue,
        JSON_OBJECT(
            'IsActive', 0
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Branch deactivated successfully.' AS Message;

END$$

DELIMITER ;
