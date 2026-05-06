DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_updateLastLoginDate`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_updateLastLoginDate`(IN `p_Username` VARCHAR(100))
BEGIN
    UPDATE users
    SET LastLoginDate = NOW()
    WHERE LOWER(Username) = LOWER(p_Username)
      AND IFNULL(IsDeleted, 0) = 0;
END$$

DELIMITER ;