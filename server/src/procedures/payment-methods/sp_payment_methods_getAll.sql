DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_payment_methods_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_payment_methods_getAll`()
BEGIN
    SELECT
	pm.PaymentMethodId,
	pm.Name,
	pm.IsCash,
	pm.Description,
	pm.IsDeleted,
	pm.DeletedBy,
	pm.DateDeleted,
	pm.CreatedAt,
	pm.CreatedBy,
	pm.UpdatedAt,
	pm.UpdatedBy,
	pm.IsActive
    FROM payment_methods pm
    WHERE pm.IsDeleted = 0
    ;
END$$

DELIMITER ;