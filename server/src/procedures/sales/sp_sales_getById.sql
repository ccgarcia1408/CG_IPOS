DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sales_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sales_getById`(IN p_SaleId INT)
BEGIN
    SELECT
        s.SaleId,
        s.BranchId,
        b.Name AS BranchName,
        b.Description AS BranchDescription,
        s.TerminalId,
        t.Name AS TerminalName,
        s.CashierId,
        e.FirstName AS CashierFirstName,
        e.LastName AS CashierLastName,
        s.ORNo,
        s.ORId,
        s.`Date`,
        s.SubTotal,
        s.Discount,
        s.DiscountId,
        d.Name AS DiscountName,
        s.Tax,
        s.TaxId,
        tx.Name AS TaxName,
        s.Total,
        s.PaymentMethodId,
        pm.Name AS PaymentMethodName,
        s.AmountPaid,
        s.ChangeAmount,
        s.IsCancelled,
        s.CancelledBy,
        s.DateCancelled,
        s.CancelReason,
        s.CreatedAt,
        s.CreatedBy
    FROM sales s
    INNER JOIN branches b ON b.BranchId = s.BranchId
    INNER JOIN terminals t ON t.TerminalId = s.TerminalId
    INNER JOIN users u ON u.UserId = s.CashierId
    INNER JOIN employees e ON e.EmployeeId = u.EmployeeId
    LEFT JOIN payment_methods pm ON pm.PaymentMethodId = s.PaymentMethodId
    LEFT JOIN discounts d ON d.DiscountId = s.DiscountId
    LEFT JOIN taxes tx ON tx.TaxId = s.TaxId
    WHERE s.SaleId = p_SaleId
      AND s.IsDeleted = 0
    LIMIT 1;
END$$

DELIMITER ;
