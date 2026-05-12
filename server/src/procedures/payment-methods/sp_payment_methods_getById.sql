DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_payment_methods_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_payment_methods_getById`(
	IN p_PaymentMethodId INT
)
BEGIN
    SELECT
	pm.PaymentMethodId,
	pm.Name,
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
    WHERE pm.PaymentMethodId = p_PaymentMethodId
    AND pm.IsDeleted = 0
    LIMIT 1
    ;
END$$

DELIMITER ;