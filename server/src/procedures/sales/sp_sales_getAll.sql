DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sales_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sales_getAll`(IN p_BranchId INT, IN p_TerminalId INT)
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
        s.CancelReason,
        s.CreatedAt,
        (SELECT COUNT(*) FROM sale_items si WHERE si.SaleId = s.SaleId AND si.IsDeleted = 0) AS ItemCount
    FROM sales s
    INNER JOIN branches b ON b.BranchId = s.BranchId
    INNER JOIN terminals t ON t.TerminalId = s.TerminalId
    INNER JOIN users u ON u.UserId = s.CashierId
    INNER JOIN employees e ON e.EmployeeId = u.EmployeeId
    LEFT JOIN payment_methods pm ON pm.PaymentMethodId = s.PaymentMethodId
    LEFT JOIN discounts d ON d.DiscountId = s.DiscountId
    LEFT JOIN taxes tx ON tx.TaxId = s.TaxId
    WHERE s.IsDeleted = 0
      AND (p_BranchId IS NULL OR s.BranchId = p_BranchId)
      AND (p_TerminalId IS NULL OR s.TerminalId = p_TerminalId)
    ORDER BY s.CreatedAt DESC, s.SaleId DESC;
END$$

DELIMITER ;
