DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_getByEmail`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_getByEmail`(IN `p_Email` VARCHAR(150))
BEGIN
    SELECT 
        UserId,
        EmployeeId,
        Username,
        Email
    FROM users
    WHERE Email = p_Email
    LIMIT 1;
END$$

DELIMITER ;