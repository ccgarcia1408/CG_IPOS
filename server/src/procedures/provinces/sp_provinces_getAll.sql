DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_provinces_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_provinces_getAll`()
BEGIN
    SELECT
	p.ProvinceId,
	p.RegionId,
	p.Name,
	p.IsDeleted,
	p.DeletedBy,
	p.DateDeleted,
	p.CreatedAt,
	p.CreatedBy,
	p.UpdatedAt,
	p.UpdatedBy,
	p.IsActive
    FROM provinces p
    WHERE p.IsDeleted = 0
    ;
END$$

DELIMITER ;