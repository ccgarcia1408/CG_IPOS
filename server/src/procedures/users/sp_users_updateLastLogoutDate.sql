DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_updateLastLogoutDate`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_updateLastLogoutDate`(IN `p_Username` VARCHAR(100))
BEGIN
    UPDATE users
    SET LastLogoutDate = NOW()
    WHERE LOWER(Username) = LOWER(p_Username)
      AND IFNULL(IsDeleted, 0) = 0;
END$$

DELIMITER ;