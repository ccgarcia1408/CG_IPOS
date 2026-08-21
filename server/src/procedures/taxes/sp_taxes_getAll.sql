DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_taxes_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_taxes_getAll`()
BEGIN
    SELECT
        t.TaxId, t.Name, t.Description, t.Rate,
        t.IsDeleted, t.DeletedBy, t.DateDeleted,
        t.CreatedAt, t.CreatedBy, t.UpdatedAt, t.UpdatedBy, t.IsActive
    FROM taxes t
    WHERE t.IsDeleted = 0
    ORDER BY t.Name;
END$$

DELIMITER ;
