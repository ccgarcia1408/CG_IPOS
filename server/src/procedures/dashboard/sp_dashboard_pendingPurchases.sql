DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_pendingPurchases`$$

-- Point-in-time actionable list (like the inventory alerts) -- not filtered by the dashboard's
-- date range, since a pending purchase from last month is still pending today.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_pendingPurchases`(
    IN p_BranchId INT
)
BEGIN
    SELECT
        p.PurchaseId,
        s.SupplierName,
        p.BranchId,
        b.Description AS BranchName,
        p.PurchaseDate,
        p.TotalAmount,
        p.Status
    FROM purchases p
    INNER JOIN suppliers s ON s.SupplierId = p.SupplierId
    INNER JOIN branches b ON b.BranchId = p.BranchId
    WHERE p.IsDeleted = 0
      AND p.Status = 'pending'
      AND (p_BranchId IS NULL OR p.BranchId = p_BranchId)
    ORDER BY p.PurchaseDate ASC;
END$$

DELIMITER ;
