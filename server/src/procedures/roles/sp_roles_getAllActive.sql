DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_roles_getAllActive`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_roles_getAllActive`()
BEGIN
    SELECT
	r.RoleId,
	r.Name,
	r.Description
    FROM roles r
    WHERE r.IsDeleted = 0
      AND r.IsActive = 1
    ORDER BY r.Name;
END$$

DELIMITER ;
