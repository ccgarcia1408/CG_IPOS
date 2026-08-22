DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_salesByPaymentMethod`$$

-- Uses sales.Total (the actual amount collected, tax included) rather than SubTotal --
-- this is a payment-reconciliation view ("how much money came in through this channel"),
-- deliberately different from the Gross Sales revenue KPI in sp_dashboard_salesSummary.
-- Percentage-of-total is computed by the caller (dashboard.service.js), not here.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_salesByPaymentMethod`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT
)
BEGIN
    SELECT
        pm.PaymentMethodId,
        pm.Name AS PaymentMethodName,
        COALESCE(SUM(s.Total), 0) AS TotalAmount,
        COUNT(s.SaleId) AS TransactionCount
    FROM payment_methods pm
    LEFT JOIN sales s ON s.PaymentMethodId = pm.PaymentMethodId
        AND s.IsCancelled = 0 AND s.IsDeleted = 0
        AND s.CreatedAt BETWEEN p_StartDate AND p_EndDate
        AND (p_BranchId IS NULL OR s.BranchId = p_BranchId)
    WHERE pm.IsDeleted = 0
    GROUP BY pm.PaymentMethodId, pm.Name
    ORDER BY TotalAmount DESC;
END$$

DELIMITER ;
