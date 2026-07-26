DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_branches_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_branches_update`(
    IN p_BranchId INT,
    IN p_Name VARCHAR(255),
    IN p_Description TEXT,
    IN p_ContactNo VARCHAR(30),
    IN p_ProvinceId INT,
    IN p_MunicipalityId INT,
    IN p_BarangayId INT,
    IN p_OtherAddress VARCHAR(255),
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
            'Failed to update branch.' AS Message;
    END;

    -- CHECK IF BRANCH EXISTS
    IF NOT EXISTS (
        SELECT 1
        FROM branches
        WHERE BranchId = p_BranchId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Branch not found.' AS Message;

    -- CHECK FOR DUPLICATE BRANCH NAME (EXCLUDE CURRENT BRANCH)
    ELSEIF EXISTS (
        SELECT 1
        FROM branches
        WHERE TRIM(NAME) = TRIM(p_Name)
          AND BranchId <> p_BranchId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Branch name already exists.' AS Message;

    ELSE

        START TRANSACTION;

        -- STORE OLD VALUES FOR AUDIT LOG
        SELECT JSON_OBJECT(
            'Name', NAME,
            'Description', Description,
            'ContactNo', ContactNo,
	        'ProvinceId', ProvinceId,
	        'MunicipalityId', MunicipalityId,
	        'BarangayId', BarangayId,
            'OtherAddress', OtherAddress,
            'IsActive', IsActive
        )
        INTO v_OldValue
        FROM branches
        WHERE BranchId = p_BranchId;

        -- UPDATE BRANCH RECORD
        UPDATE branches
        SET
            NAME = TRIM(p_Name),
            Description = p_Description,
            ContactNo = p_ContactNo,
            ProvinceId = p_ProvinceId,
            MunicipalityId = p_MunicipalityId,
            BarangayId = p_BarangayId,
            OtherAddress = p_OtherAddress,
            UpdatedAt = NOW(),
            UpdatedBy = p_UpdatedBy,
            IsActive = p_IsActive
        WHERE BranchId = p_BranchId
        AND IsDeleted = 0;

        -- STORE NEW VALUES FOR AUDIT LOG
        SET v_NewValue = JSON_OBJECT(
            'Name', TRIM(p_Name),
            'Description', p_Description,
            'ContactNo', p_ContactNo,
            'ProvinceId', p_ProvinceId,
            'MunicipalityId', p_MunicipalityId,
            'BarangayId', p_BarangayId,
            'OtherAddress', p_OtherAddress,
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
            'Updated branch',
            'branches',
            p_BranchId,
            v_OldValue,
            v_NewValue,
            p_UpdatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'Branch updated successfully.' AS Message;

    END IF;

END$$

DELIMITER ;