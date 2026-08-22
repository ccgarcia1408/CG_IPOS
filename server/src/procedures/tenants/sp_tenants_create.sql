DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_tenants_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_tenants_create`(
    IN p_Name VARCHAR(255),
    IN p_Description TEXT,
    IN p_ContactNo VARCHAR(30),
    IN p_Email VARCHAR(150),
    IN p_CreatedBy INT
)
BEGIN
    DECLARE v_TenantId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create tenant.' AS Message,
            NULL AS TenantId;
    END;

    -- Check if tenant name already exists
    IF EXISTS (
        SELECT 1
        FROM tenants
        WHERE TRIM(NAME) = TRIM(p_Name)
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Tenant name already exists.' AS Message,
            NULL AS TenantId;

    ELSE

        START TRANSACTION;

        INSERT INTO tenants (
            NAME,
            Description,
            ContactNo,
            Email,
            IsDeleted,
            CreatedAt,
            CreatedBy,
            IsActive
        )
        VALUES (
            TRIM(p_Name),
            p_Description,
            p_ContactNo,
            p_Email,
            0,
            NOW(),
            p_CreatedBy,
            1
        );

        SET v_TenantId = LAST_INSERT_ID();

        -- Audit Log
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
            'Created tenant',
            'tenants',
            v_TenantId,
            NULL,
            JSON_OBJECT(
                'Name', TRIM(p_Name),
                'Description', p_Description,
                'ContactNo', p_ContactNo,
                'Email', p_Email,
                'IsActive', 1
            ),
            p_CreatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'Tenant created successfully.' AS Message,
            v_TenantId AS TenantId;

    END IF;

END$$

DELIMITER ;
