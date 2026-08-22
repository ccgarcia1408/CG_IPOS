DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_taxes_getAllActive`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_taxes_getAllActive`()
BEGIN
    SELECT
        t.TaxId, t.Name, t.Description, t.Rate
    FROM taxes t
    WHERE t.IsDeleted = 0 AND t.IsActive = 1
    ORDER BY t.Name;
END$$

DELIMITER ;
