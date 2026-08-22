DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_stockAdjustmentSummary`$$

-- inventory_logs.Quantity is a SIGNED delta for ADJUSTMENT rows (positive = stock added,
-- negative = stock removed via a physical-count correction) -- confirmed against
-- sp_inventory_adjustStock, which is the only writer of TransactionType='ADJUSTMENT'.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_stockAdjustmentSummary`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT
)
BEGIN
    SELECT
        COUNT(*) AS AdjustmentCount,
        COALESCE(SUM(CASE WHEN Quantity > 0 THEN Quantity ELSE 0 END), 0) AS StockAdded,
        COALESCE(SUM(CASE WHEN Quantity < 0 THEN -Quantity ELSE 0 END), 0) AS StockRemoved
    FROM inventory_logs
    WHERE IsDeleted = 0
      AND TransactionType = 'ADJUSTMENT'
      AND CreatedAt BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR BranchId = p_BranchId);
END$$

DELIMITER ;
