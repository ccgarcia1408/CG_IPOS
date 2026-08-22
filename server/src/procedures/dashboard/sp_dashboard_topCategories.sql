DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_topCategories`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_topCategories`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT
)
BEGIN
    SELECT
        p.CategoryId,
        COALESCE(c.Name, 'Uncategorized') AS CategoryName,
        SUM(si.Quantity) AS QuantitySold,
        SUM(si.Total) AS Sales
    FROM sale_items si
    INNER JOIN sales s ON s.SaleId = si.SaleId
    INNER JOIN products p ON p.ProductId = si.ProductId
    LEFT JOIN categories c ON c.CategoryId = p.CategoryId
    WHERE si.IsDeleted = 0
      AND s.IsCancelled = 0 AND s.IsDeleted = 0
      AND s.CreatedAt BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR s.BranchId = p_BranchId)
    GROUP BY p.CategoryId, CategoryName
    ORDER BY Sales DESC;
END$$

DELIMITER ;
