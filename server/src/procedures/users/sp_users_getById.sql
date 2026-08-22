DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_getById`(IN `p_UserId` INT)
BEGIN
    SELECT
        u.UserId,
        u.EmployeeId,
        u.RoleId,
        r.Name AS RoleName,
        u.Username,
        u.Email,
        e.ContactNo,
        e.ProfilePicture,
        e.FirstName,
        e.MiddleName,
        e.LastName,
        e.Age,
        e.Address,
        e.DateHired,
        e.IsResigned,
        u.LastLoginDate,
        u.LastLogoutDate,
        u.IsPasswordChanged,
        u.IsAccountVerified,
        u.AccountVerifiedDate,
        u.IsActive,
        u.CreatedAt,
        u.UpdatedAt
    FROM users u
    INNER JOIN employees e ON e.EmployeeId = u.EmployeeId
    LEFT JOIN roles r ON r.RoleId = u.RoleId
    WHERE u.UserId = p_UserId
    AND IFNULL(u.IsDeleted, 0) = 0
    LIMIT 1;
END$$

DELIMITER ;
