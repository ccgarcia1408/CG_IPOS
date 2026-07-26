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
    IN `p_Password` VARCHAR(255)
)
BEGIN
    DECLARE v_EmployeeId INT;
    DECLARE v_EmailCount INT DEFAULT 0;
    DECLARE v_UsernameCount INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION

    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- CHECK IF USER EXISTS AND GET EMPLOYEE ID
    SELECT EmployeeId
    INTO v_EmployeeId
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
        Username = LOWER(p_Username),
        Email = p_Email,
        `Password` = 
            CASE
                WHEN p_Password IS NULL OR TRIM(p_Password) = '' THEN `Password`
                ELSE p_Password
            END
    WHERE UserId = p_UserId
    AND IFNULL(IsDeleted, 0) = 0;

    COMMIT;
        SELECT p_UserId AS UserId;
END$$

DELIMITER ;