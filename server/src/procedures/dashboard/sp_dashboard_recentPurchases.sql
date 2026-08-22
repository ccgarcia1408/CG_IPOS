DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_recentPurchases`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_recentPurchases`(
    IN p_StartDate DATE,
    IN p_EndDate DATE,
    IN p_BranchId INT,
    IN p_Limit INT
)
BEGIN
    SELECT
        p.PurchaseId,
        s.SupplierName,
        p.BranchId,
        b.Description AS BranchName,
        p.TotalAmount,
        p.Status,
        p.PurchaseDate
    FROM purchases p
    INNER JOIN suppliers s ON s.SupplierId = p.SupplierId
    INNER JOIN branches b ON b.BranchId = p.BranchId
    WHERE p.IsDeleted = 0
      AND p.PurchaseDate BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR p.BranchId = p_BranchId)
    ORDER BY p.PurchaseDate DESC, p.PurchaseId DESC
    LIMIT p_Limit;
END$$

DELIMITER ;
