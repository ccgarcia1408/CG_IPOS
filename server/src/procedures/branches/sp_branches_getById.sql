DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_branches_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_branches_getById`(
    IN p_BranchId INT
)
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
    WHERE b.BranchId = p_BranchId
    AND b.IsDeleted = 0
    LIMIT 1;

END$$

DELIMITER ;