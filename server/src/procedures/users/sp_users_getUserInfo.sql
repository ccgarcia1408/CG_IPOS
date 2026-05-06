DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_getUserInfo`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_getUserInfo`(IN `p_Username` VARCHAR(30))
BEGIN
    SELECT
	employees.`FirstName`,
	employees.`MiddleName`,
	employees.`LastName`,
	employees.`Address`,
	employees.`Age`,
	employees.`ContactNo`,
	employees.`DateHired`,
	employees.`IsResigned`,
	users.`UserId`,
	users.`EmployeeId`,
	users.`RoleId`,
	users.`Username`,
	users.`Email`,
	users.`Password`,
	users.`LastLoginDate`,
	users.`LastLogoutDate`,
	users.`IsPasswordChanged`,
	users.`PasswordChangeDate`,
	users.`IsAccountVerified`,
	users.`AccountVerifiedDate`,
	users.`IsDeleted`,
	users.`DeletedBy`,
	users.`DateDeleted`,
	users.`CreatedAt`,
	users.`IsActive`,
	roles.`Name` AS RoleName
    FROM users
    INNER JOIN employees ON users.`EmployeeId` = employees.`EmployeeId`
    LEFT JOIN roles ON users.`RoleId` = roles.`RoleId`
    WHERE Username = p_Username
    LIMIT 1;
END$$

DELIMITER ;