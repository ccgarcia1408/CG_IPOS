DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_getAll`()
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
        u.UpdatedAt,
        (
            SELECT GROUP_CONCAT(b.Description ORDER BY b.Description SEPARATOR ', ')
            FROM user_branches ub
            INNER JOIN branches b ON b.BranchId = ub.BranchId
            WHERE ub.UserId = u.UserId
              AND ub.IsDeleted = 0
              AND ub.IsActive = 1
              AND b.IsDeleted = 0
              AND b.IsActive = 1
        ) AS BranchNames
    FROM users u
    INNER JOIN employees e ON e.EmployeeId = u.EmployeeId
    LEFT JOIN roles r ON r.RoleId = u.RoleId
    WHERE IFNULL(u.IsDeleted, 0) = 0
    ORDER BY u.UserId DESC;
END$$

DELIMITER ;
