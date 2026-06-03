DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_regions_getAllActive`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_regions_getAllActive`()
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
    AND r.IsActive = 1
    ;
END$$

DELIMITER ;