DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_recentStockAdjustments`$$

-- No "Status" column -- adjustments in this schema are applied immediately (no approval
-- workflow), so there's nothing to show there beyond what's already implied by the row
-- existing at all.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_recentStockAdjustments`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT,
    IN p_Limit INT
)
BEGIN
    SELECT
        il.InventoryLogId,
        il.CreatedAt,
        p.Name AS ProductName,
        il.BranchId,
        b.Description AS BranchName,
        il.Quantity,
        il.Remarks AS Reason,
        CONCAT(e.FirstName, ' ', e.LastName) AS UserName
    FROM inventory_logs il
    INNER JOIN products p ON p.ProductId = il.ProductId
    INNER JOIN branches b ON b.BranchId = il.BranchId
    LEFT JOIN users u ON u.UserId = il.CreatedBy
    LEFT JOIN employees e ON e.EmployeeId = u.EmployeeId
    WHERE il.IsDeleted = 0
      AND il.TransactionType = 'ADJUSTMENT'
      AND il.CreatedAt BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR il.BranchId = p_BranchId)
    ORDER BY il.CreatedAt DESC
    LIMIT p_Limit;
END$$

DELIMITER ;
