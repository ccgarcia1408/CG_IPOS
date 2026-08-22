DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_tenants_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_tenants_update`(
    IN p_TenantId INT,
    IN p_Name VARCHAR(255),
    IN p_Description TEXT,
    IN p_ContactNo VARCHAR(30),
    IN p_Email VARCHAR(150),
    IN p_UpdatedBy INT,
    IN p_IsActive TINYINT
)
BEGIN
    DECLARE v_OldValue JSON;
    DECLARE v_NewValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to update tenant.' AS Message;
    END;

    -- CHECK IF TENANT EXISTS
    IF NOT EXISTS (
        SELECT 1
        FROM tenants
        WHERE TenantId = p_TenantId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Tenant not found.' AS Message;

    -- CHECK FOR DUPLICATE TENANT NAME (EXCLUDE CURRENT TENANT)
    ELSEIF EXISTS (
        SELECT 1
        FROM tenants
        WHERE TRIM(NAME) = TRIM(p_Name)
          AND TenantId <> p_TenantId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Tenant name already exists.' AS Message;

    ELSE

        START TRANSACTION;

        -- STORE OLD VALUES FOR AUDIT LOG
        SELECT JSON_OBJECT(
            'Name', NAME,
            'Description', Description,
            'ContactNo', ContactNo,
            'Email', Email,
            'IsActive', IsActive
        )
        INTO v_OldValue
        FROM tenants
        WHERE TenantId = p_TenantId;

        -- UPDATE TENANT RECORD
        UPDATE tenants
        SET
            NAME = TRIM(p_Name),
            Description = p_Description,
            ContactNo = p_ContactNo,
            Email = p_Email,
            UpdatedAt = NOW(),
            UpdatedBy = p_UpdatedBy,
            IsActive = p_IsActive
        WHERE TenantId = p_TenantId
        AND IsDeleted = 0;

        -- STORE NEW VALUES FOR AUDIT LOG
        SET v_NewValue = JSON_OBJECT(
            'Name', TRIM(p_Name),
            'Description', p_Description,
            'ContactNo', p_ContactNo,
            'Email', p_Email,
            'IsActive', p_IsActive
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
            'Updated tenant',
            'tenants',
            p_TenantId,
            v_OldValue,
            v_NewValue,
            p_UpdatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'Tenant updated successfully.' AS Message;

    END IF;

END$$

DELIMITER ;
