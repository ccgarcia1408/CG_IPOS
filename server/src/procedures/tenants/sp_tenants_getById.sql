DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_tenants_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_tenants_getById`(
    IN p_TenantId INT
)
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
    WHERE TenantId = p_TenantId
    AND IsDeleted = 0
    LIMIT 1;

END$$

DELIMITER ;
