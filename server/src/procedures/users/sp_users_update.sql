DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_update`(
    IN `p_UserId` INT,
    IN `p_FirstName` VARCHAR(100),
    IN `p_MiddleName` VARCHAR(100),
    IN `p_LastName` VARCHAR(100),
    IN `p_Email` VARCHAR(150),
    IN `p_Age` INT,
    IN `p_Address` TEXT,
    IN `p_ContactNo` VARCHAR(30),
    IN `p_Username` VARCHAR(100),
    IN `p_Password` VARCHAR(255),
    IN `p_RoleId` INT,
    IN `p_IsActive` TINYINT,
    IN `p_IsAccountVerified` TINYINT,
    IN `p_UpdatedBy` INT
)
BEGIN
    DECLARE v_EmployeeId INT;
    DECLARE v_EmailCount INT DEFAULT 0;
    DECLARE v_UsernameCount INT DEFAULT 0;
    DECLARE v_OldIsAccountVerified TINYINT DEFAULT 0;
    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION

    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- CHECK IF USER EXISTS AND GET EMPLOYEE ID
    SELECT EmployeeId, IsAccountVerified
    INTO v_EmployeeId, v_OldIsAccountVerified
    FROM users
    WHERE UserId = p_UserId
    AND IFNULL(IsDeleted, 0) = 0
    LIMIT 1;

    IF v_EmployeeId IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User not found.';
    END IF;

    -- CHECK IF EMAIL ALREADY EXISTS IN THE USERS TABLE
    SELECT COUNT(*)
    INTO v_EmailCount
    FROM users
    WHERE Email = p_Email
    AND UserId <> p_UserId
    AND IFNULL(IsDeleted, 0) = 0;

    IF v_EmailCount > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Email already exists.';
    END IF;

    -- CHECK IF USERNAME ALREADY EXISTS IN THE USERS TABLE
    SELECT COUNT(*)
    INTO v_UsernameCount
    FROM users
    WHERE LOWER(Username) = LOWER(p_Username)
    AND UserId <> p_UserId
    AND IFNULL(IsDeleted, 0) = 0;

    IF v_UsernameCount > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Username already exists.';
    END IF;

    -- CHECK IF ROLE EXISTS AND IS USABLE
    IF p_RoleId IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM roles WHERE RoleId = p_RoleId AND IsDeleted = 0 AND IsActive = 1
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Selected role is invalid or inactive.';
    END IF;

    -- OLD VALUE SNAPSHOT
    SELECT JSON_OBJECT(
        'RoleId', RoleId,
        'Username', Username,
        'Email', Email,
        'IsActive', IsActive,
        'IsAccountVerified', IsAccountVerified
    )
    INTO v_OldValue
    FROM users
    WHERE UserId = p_UserId;

    -- UPDATE EMPLOYEES TABLE
    UPDATE employees
    SET
        FirstName = TRIM(UPPER(p_FirstName)),
        MiddleName =
            CASE
                WHEN p_MiddleName IS NULL OR TRIM(p_MiddleName) = '' THEN NULL
                ELSE TRIM(UPPER(p_MiddleName))
            END,
        LastName = TRIM(UPPER(p_LastName)),
        ContactNo = p_ContactNo,
        Age = p_Age,
        Address = p_Address
    WHERE EmployeeId = v_EmployeeId;

    -- UPDATE USERS TABLE
    UPDATE users
    SET
        RoleId = p_RoleId,
        Username = LOWER(p_Username),
        Email = p_Email,
        `Password` =
            CASE
                WHEN p_Password IS NULL OR TRIM(p_Password) = '' THEN `Password`
                ELSE p_Password
            END,
        IsActive = p_IsActive,
        IsAccountVerified = p_IsAccountVerified,
        AccountVerifiedDate = CASE
            WHEN p_IsAccountVerified = 1 AND v_OldIsAccountVerified = 0 THEN NOW()
            ELSE AccountVerifiedDate
        END,
        UpdatedAt = NOW(),
        UpdatedBy = p_UpdatedBy
    WHERE UserId = p_UserId
    AND IFNULL(IsDeleted, 0) = 0;

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
        'Updated user',
        'users',
        p_UserId,
        v_OldValue,
        JSON_OBJECT(
            'RoleId', p_RoleId,
            'Username', LOWER(p_Username),
            'Email', p_Email,
            'IsActive', p_IsActive,
            'IsAccountVerified', p_IsAccountVerified
        ),
        p_UpdatedBy
    );

    COMMIT;
        SELECT p_UserId AS UserId;
END$$

DELIMITER ;
