DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_purchasingSummary`$$

-- purchases.Status is a real 3-value ENUM ('pending','received','cancelled') -- there is no
-- Draft/Approved/Partially-Received distinction in this schema (receiving is a single
-- all-or-nothing transition via sp_purchases_receive), so this KPI set reflects only the
-- statuses that actually exist rather than inventing sub-states the ticket imagined.
-- Filtered by PurchaseDate against the dashboard's date range.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_purchasingSummary`(
    IN p_StartDate DATE,
    IN p_EndDate DATE,
    IN p_BranchId INT
)
BEGIN
    SELECT
        COUNT(*) AS TotalPurchases,
        COALESCE(SUM(TotalAmount), 0) AS PurchaseAmount,
        COALESCE(SUM(CASE WHEN Status = 'pending' THEN 1 ELSE 0 END), 0) AS PendingCount,
        COALESCE(SUM(CASE WHEN Status = 'pending' THEN TotalAmount ELSE 0 END), 0) AS PendingAmount,
        COALESCE(SUM(CASE WHEN Status = 'received' THEN 1 ELSE 0 END), 0) AS ReceivedCount,
        COALESCE(SUM(CASE WHEN Status = 'received' THEN TotalAmount ELSE 0 END), 0) AS ReceivedAmount,
        COALESCE(SUM(CASE WHEN Status = 'cancelled' THEN 1 ELSE 0 END), 0) AS CancelledCount,
        COALESCE(SUM(CASE WHEN Status = 'cancelled' THEN TotalAmount ELSE 0 END), 0) AS CancelledAmount
    FROM purchases
    WHERE IsDeleted = 0
      AND PurchaseDate BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR BranchId = p_BranchId);
END$$

DELIMITER ;
