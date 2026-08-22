DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_supplierSummary`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_supplierSummary`(
    IN p_StartDate DATE,
    IN p_EndDate DATE,
    IN p_BranchId INT
)
BEGIN
    SELECT
        s.SupplierId,
        s.SupplierName,
        COUNT(p.PurchaseId) AS PurchaseCount,
        COALESCE(SUM(p.TotalAmount), 0) AS TotalAmount
    FROM suppliers s
    LEFT JOIN purchases p ON p.SupplierId = s.SupplierId
        AND p.IsDeleted = 0
        AND p.PurchaseDate BETWEEN p_StartDate AND p_EndDate
        AND (p_BranchId IS NULL OR p.BranchId = p_BranchId)
    WHERE s.IsDeleted = 0
    GROUP BY s.SupplierId, s.SupplierName
    HAVING PurchaseCount > 0
    ORDER BY TotalAmount DESC;
END$$

DELIMITER ;
