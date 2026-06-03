DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_barangays_getAllActive`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_barangays_getAllActive`()
BEGIN
    SELECT
	b.BarangayId,
	b.MunicipalityId,
	b.Name,
	b.IsDeleted,
	b.DeletedBy,
	b.DateDeleted,
	b.CreatedAt,
	b.CreatedBy,
	b.UpdatedAt,
	b.UpdatedBy,
	b.IsActive
    FROM barangays b
    WHERE b.IsDeleted = 0
    AND b.IsActive = 1
    ;
END$$

DELIMITER ;