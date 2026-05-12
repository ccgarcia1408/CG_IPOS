DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_suppliers_getAllActive`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_suppliers_getAllActive`()
BEGIN
    SELECT
	s.SupplierId,
	s.SupplierName,
	s.ContactPerson,
	s.ContactNo,
	s.Email,
	s.Address,
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
    AND s.IsActive = 1
    ;
END$$

DELIMITER ;