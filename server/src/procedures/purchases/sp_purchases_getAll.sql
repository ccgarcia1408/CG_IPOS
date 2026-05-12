DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchases_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchases_getAll`()
BEGIN
    SELECT
	pur.PurchaseId,
	pur.SupplierId,
	pur.PurchaseDate,
	pur.TotalAmount,
	pur.Status,
	pur.IsDeleted,
	pur.DeletedBy,
	pur.DateDeleted,
	pur.CreatedAt,
	pur.CreatedBy,
	pur.UpdatedAt,
	pur.UpdatedBy
    FROM purchases pur
    WHERE pur.IsDeleted = 0
    ;
END$$

DELIMITER ;