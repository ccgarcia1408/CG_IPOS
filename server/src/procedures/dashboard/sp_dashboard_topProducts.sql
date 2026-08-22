DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_topProducts`$$

-- p_SortBy: 'QUANTITY' or 'REVENUE'. Returns every product sold in the period (not just the
-- top N) -- dashboard.service.js slices the top N and computes rank/percentage-of-sales
-- against the *full* period total, not just the top-N subset's own sum.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_topProducts`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT,
    IN p_SortBy VARCHAR(10)
)
BEGIN
    SELECT
        p.ProductId,
        p.Name AS ProductName,
        p.SKU,
        COALESCE(c.Name, 'Uncategorized') AS CategoryName,
        SUM(si.Quantity) AS QuantitySold,
        SUM(si.Total) AS SalesAmount
    FROM sale_items si
    INNER JOIN sales s ON s.SaleId = si.SaleId
    INNER JOIN products p ON p.ProductId = si.ProductId
    LEFT JOIN categories c ON c.CategoryId = p.CategoryId
    WHERE si.IsDeleted = 0
      AND s.IsCancelled = 0 AND s.IsDeleted = 0
      AND s.CreatedAt BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR s.BranchId = p_BranchId)
    GROUP BY p.ProductId, p.Name, p.SKU, CategoryName
    ORDER BY (CASE WHEN p_SortBy = 'QUANTITY' THEN SUM(si.Quantity) ELSE SUM(si.Total) END) DESC;
END$$

DELIMITER ;
