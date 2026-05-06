DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_getAll`()
BEGIN
    SELECT 
        u.UserId,
        u.EmployeeId,
        u.Username,
        u.Email,
        e.FirstName,
        e.MiddleName,
        e.LastName,
        e.Age,
        e.Address,
        u.CreatedAt,
        u.UpdatedAt
    FROM users u
    INNER JOIN employees e ON e.EmployeeId = u.EmployeeId
    ORDER BY u.UserId DESC;
END$$

DELIMITER ;