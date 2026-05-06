DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_menus_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_menus_getAll`()
BEGIN
    SELECT
	m.MenuId,
	m.ParentMenuId,
	m.Name,
	m.Icon,
	m.Path,
	m.Sorting,
	m.IsActive
    FROM menus m
    ;
END$$

DELIMITER ;