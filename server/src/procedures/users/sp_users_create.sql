DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_create`(IN `p_FirstName` VARCHAR(100), IN `p_MiddleName` VARCHAR(100), IN `p_LastName` VARCHAR(100), IN `p_Email` VARCHAR(150), IN `p_Age` INT, IN `p_Address` TEXT, IN `p_ContactNo` VARCHAR(30), IN `p_Username` VARCHAR(100), IN `p_Password` VARCHAR(255))
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
    SELECT COUNT(*) INTO v_EmailCount
    FROM users
    WHERE Email = p_Email;
    IF v_EmailCount > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Email already exists.';
    END IF;
    
    SELECT COUNT(*) INTO v_UsernameCount
    FROM users
    WHERE LOWER(Username) = LOWER(p_Username);
    IF v_UsernameCount > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Username already exists.';
    END IF;
    INSERT INTO employees (
        FirstName,
        MiddleName,
        LastName,
        ContactNo,
        Age,
        Address
    )
    VALUES (
        TRIM(UPPER(p_FirstName)),
        TRIM(UPPER(p_MiddleName)),
        TRIM(UPPER(p_LastName)),
        p_ContactNo,
        p_Age,
        p_Address
    );
    SET v_EmployeeId = LAST_INSERT_ID();
    INSERT INTO users (
        EmployeeId,
        Username,
        Email,
        `PASSWORD`
    )
    VALUES (
        v_EmployeeId,
        LOWER(p_Username),
        p_Email,
        p_Password
    );
    
    SET v_UserId = LAST_INSERT_ID();
        
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
	'CREATE NEW USER',
	'User',
	'users',
	v_UserId,
	NULL,
	v_UserId,
	v_UserId
    );
    COMMIT;
    SELECT v_EmployeeId AS EmployeeId, LAST_INSERT_ID() AS UserId;
END$$

DELIMITER ;