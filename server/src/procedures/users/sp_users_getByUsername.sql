DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_getByUsername`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_getByUsername`(IN `p_Username` VARCHAR(30))
BEGIN
    SELECT Username
    FROM users
    WHERE Username = p_Username
    LIMIT 1;
END$$

DELIMITER ;