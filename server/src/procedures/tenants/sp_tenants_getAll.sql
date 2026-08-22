DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_tenants_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_tenants_getAll`()
BEGIN
    SELECT
	TenantId,
	Name,
	Description,
	ContactNo,
	Email,
	IsDeleted,
	DeletedBy,
	DateDeleted,
	CreatedAt,
	CreatedBy,
	UpdatedAt,
	UpdatedBy,
	IsActive
    FROM tenants
    WHERE IsDeleted = 0
    ;
END$$

DELIMITER ;
