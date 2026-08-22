DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_taxes_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_taxes_getById`(IN p_TaxId INT)
BEGIN
    SELECT
        t.TaxId, t.Name, t.Description, t.Rate,
        t.IsDeleted, t.DeletedBy, t.DateDeleted,
        t.CreatedAt, t.CreatedBy, t.UpdatedAt, t.UpdatedBy, t.IsActive
    FROM taxes t
    WHERE t.TaxId = p_TaxId AND t.IsDeleted = 0
    LIMIT 1;
END$$

DELIMITER ;
