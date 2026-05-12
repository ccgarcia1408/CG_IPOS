DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_suppliers_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_suppliers_getById`(
    IN p_SupplierId INT
)
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
    WHERE s.SupplierId = p_SupplierId
    AND s.IsDeleted = 0
    LIMIT 1;

END$$

DELIMITER ;