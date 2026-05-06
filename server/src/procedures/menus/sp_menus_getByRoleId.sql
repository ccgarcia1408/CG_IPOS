DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_menus_getByRoleId`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_menus_getByRoleId`(IN `p_RoleId` INT)
BEGIN
    SELECT
	m.MenuId,
	m.ParentMenuId,
	m.Name,
	m.Icon,
	m.Path,
	m.Sorting,
	m.IsActive
    FROM menu_roles mr
    LEFT JOIN menus m ON mr.MenuId = m.MenuId
    WHERE mr.RoleId = p_RoleId
    ;
END$$

DELIMITER ;