DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_roles_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_roles_getAll`()
BEGIN
    SELECT
	r.RoleId,
	r.Name,
	r.Description,
	r.IsDeleted,
	r.DeletedBy,
	r.DateDeleted,
	r.CreatedAt,
	r.CreatedBy,
	r.UpdatedAt,
	r.UpdatedBy,
	r.IsActive
    FROM roles r
    WHERE r.IsDeleted = 0
    ;
END$$

DELIMITER ;