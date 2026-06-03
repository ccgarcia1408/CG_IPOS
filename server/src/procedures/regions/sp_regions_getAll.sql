DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_regions_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_regions_getAll`()
BEGIN
    SELECT
	r.RegionId,
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
    FROM regions r
    WHERE r.IsDeleted = 0
    ;
END$$

DELIMITER ;