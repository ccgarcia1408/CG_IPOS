DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sales_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sales_getById`(
    IN p_SaleId INT
)
BEGIN

    SELECT
        s.SaleId,
        s.ORNo,
        s.CashierId,
        s.Date,
        s.SubTotal,
        s.Discount,
        s.Tax,
        s.Total,
        s.PaymentMethodId,
        s.AmountPaid,
        s.ChangeAmount,
        s.IsCancelled,
        s.CancelledBy,
        s.DateCancelled,
        s.CancelReason,
        s.IsDeleted,
        s.DeletedBy,
        s.DateDeleted,
        s.CreatedAt,
        s.CreatedBy,
        s.UpdatedAt,
        s.UpdatedBy
    FROM sales s
    WHERE s.SaleId = p_SaleId
    AND s.IsDeleted = 0
    LIMIT 1;

END$$

DELIMITER ;