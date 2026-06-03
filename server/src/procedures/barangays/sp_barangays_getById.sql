DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_barangays_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_barangays_getById`(
	IN p_BarangayId INT
)
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
    AND b.BarangayId = p_BarangayId
    ;
END$$

DELIMITER ;