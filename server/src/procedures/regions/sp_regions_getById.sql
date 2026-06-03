DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_regions_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_regions_getById`(
	IN p_RegionId INT
)
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
    AND r.RegionId = p_RegionId
    ;
END$$

DELIMITER ;