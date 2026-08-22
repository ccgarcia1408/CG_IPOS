DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_tenants_getAllActive`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_tenants_getAllActive`()
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
    AND IsActive = 1
    ;
END$$

DELIMITER ;
