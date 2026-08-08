DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_suppliers_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_suppliers_getAll`()
BEGIN
    SELECT
	s.SupplierId,
	s.SupplierName,
	s.ContactPerson,
	s.ContactNo,
	s.TelNo,
	s.Email,
	s.ProvinceId,
	s.MunicipalityId,
	s.BarangayId,
	s.OtherAddress,
	s.IsDeleted,
	s.DeletedBy,
	s.DateDeleted,
	s.CreatedAt,
	s.CreatedBy,
	s.UpdatedAt,
	s.UpdatedBy,
	s.IsActive
    FROM suppliers s
    WHERE s.IsDeleted = 0
    ;
END$$

DELIMITER ;
