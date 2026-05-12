DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_system_config_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_system_config_getById`(
	IN p_SystemConfigId INT
)
BEGIN
    SELECT
	sc.SystemConfigId,
	sc.DefaultPassword
    FROM system_config sc
    WHERE SystemConfigId = p_SystemConfigId
    LIMIT 1
    ;
END$$

DELIMITER ;