DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_create`(
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
    IN `p_CreatedBy` INT
)
BEGIN
    DECLARE v_EmployeeId INT;
    DECLARE v_EmailCount INT DEFAULT 0;
    DECLARE v_UsernameCount INT DEFAULT 0;
    DECLARE v_UserId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION

    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- CHECK IF EMAIL ALREADY EXISTS IN THE USERS TABLE
    SELECT COUNT(*) INTO v_EmailCount
    FROM users
    WHERE Email = p_Email;

    IF v_EmailCount > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Email already exists.';
    END IF;

    -- CHECK IF USERNAME ALREADY EXISTS IN THE USERS TABLE
    SELECT COUNT(*) INTO v_UsernameCount
    FROM users
    WHERE LOWER(Username) = LOWER(p_Username);

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

    -- INSERT INTO EMPLOYEES TABLE
    INSERT INTO employees (
        FirstName,
        MiddleName,
        LastName,
        ContactNo,
        Age,
        Address,
        DateHired
    )
    VALUES (
        TRIM(UPPER(p_FirstName)),
        TRIM(UPPER(p_MiddleName)),
        TRIM(UPPER(p_LastName)),
        p_ContactNo,
        p_Age,
        p_Address,
        NOW()
    );

    SET v_EmployeeId = LAST_INSERT_ID();

    -- INSERT INTO USERS TABLE
    -- Created through admin-driven User Maintenance (no self-service sign-up/verification flow
    -- exists), so the account is usable immediately: active and verified at creation.
    INSERT INTO users (
        EmployeeId,
        RoleId,
        Username,
        Email,
        `Password`,
        IsActive,
        IsAccountVerified,
        AccountVerifiedDate
    )
    VALUES (
        v_EmployeeId,
        p_RoleId,
        LOWER(p_Username),
        p_Email,
        p_Password,
        1,
        1,
        NOW()
    );

    SET v_UserId = LAST_INSERT_ID();

    -- INSERT INTO AUDIT_LOGS TABLE
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
        'Created user',
        'users',
        v_UserId,
        NULL,
        JSON_OBJECT(
            'EmployeeId', v_EmployeeId,
            'RoleId', p_RoleId,
            'Username', LOWER(p_Username),
            'Email', p_Email
        ),
        IFNULL(p_CreatedBy, v_UserId)
    );

    COMMIT;
        SELECT v_EmployeeId AS EmployeeId, v_UserId AS UserId;

END$$

DELIMITER ;
