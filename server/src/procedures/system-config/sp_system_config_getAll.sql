DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_system_config_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_system_config_getAll`()
BEGIN
    SELECT
	sc.SystemConfigId,
	sc.DefaultPassword
    FROM system_config sc
    ;
END$$

DELIMITER ;