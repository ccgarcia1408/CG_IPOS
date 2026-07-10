DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_branches_getAllActive`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_branches_getAllActive`()
BEGIN
    SELECT
	b.BranchId,
	b.Name,
	b.Description,
	b.ContactNo,
	b.ProvinceId,
	p.Name AS Province,
	b.MunicipalityId,
	m.Name AS Municipality,
	b.BarangayId,
	br.Name AS Barangay,
	b.OtherAddress,
	b.IsDeleted,
	b.DeletedBy,
	b.DateDeleted,
	b.CreatedAt,
	b.CreatedBy,
	b.UpdatedAt,
	b.UpdatedBy,
	b.IsActive
    FROM branches b
    LEFT JOIN provinces p ON b.ProvinceId = p.ProvinceId
    LEFT JOIN municipalities m ON b.MunicipalityId = m.MunicipalityId
    LEFT JOIN barangays br ON b.BarangayId = br.BarangayId
    WHERE b.IsDeleted = 0
    AND b.IsActive = 1
    ;
END$$

DELIMITER ;