DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_topReturnedProducts`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_topReturnedProducts`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT,
    IN p_Limit INT
)
BEGIN
    SELECT
        p.ProductId,
        p.Name AS ProductName,
        p.SKU,
        SUM(sr.QuantityReturned) AS QuantityReturned,
        SUM(sr.RefundAmount) AS ReturnValue
    FROM sale_returns sr
    INNER JOIN products p ON p.ProductId = sr.ProductId
    WHERE sr.CreatedAt BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR sr.BranchId = p_BranchId)
    GROUP BY p.ProductId, p.Name, p.SKU
    ORDER BY QuantityReturned DESC
    LIMIT p_Limit;
END$$

DELIMITER ;
