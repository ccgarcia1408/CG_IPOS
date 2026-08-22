DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_tenants_delete`$$

-- Tenants are referenced by a RESTRICT FK from branches. getById filters on IsDeleted, so a
-- true soft-delete would make a tenant permanently unfetchable by ID once any branch
-- references it. "Delete" therefore deactivates, matching sp_branches_delete's precedent.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_tenants_delete`(
    IN p_TenantId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to deactivate tenant.' AS Message;
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
    FROM tenants
    WHERE TenantId = p_TenantId;

    -- DEACTIVATE
    UPDATE tenants
    SET
        IsActive = 0,
        UpdatedAt = NOW(),
        UpdatedBy = p_DeletedBy
    WHERE TenantId = p_TenantId
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
        'Deactivated tenant',
        'tenants',
        p_TenantId,
        v_OldValue,
        JSON_OBJECT(
            'IsActive', 0
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Tenant deactivated successfully.' AS Message;

END$$

DELIMITER ;
