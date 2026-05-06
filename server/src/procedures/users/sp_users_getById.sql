DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_getById`(IN `p_UserId` INT)
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
    WHERE u.UserId = p_UserId
    LIMIT 1;
END$$

DELIMITER ;