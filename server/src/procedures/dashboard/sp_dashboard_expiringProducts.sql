DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_expiringProducts`$$

-- p_ThresholdDays is configurable (ticket asks for 7/15/30-day thresholds). Only products with
-- remaining stock at the branch are shown -- an expiring product with zero stock isn't
-- actionable here (it'd already be in the out-of-stock alert instead).
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_expiringProducts`(
    IN p_BranchId INT,
    IN p_ThresholdDays INT
)
BEGIN
    SELECT
        p.ProductId,
        p.Name AS ProductName,
        p.SKU,
        i.BranchId,
        b.Description AS BranchName,
        i.Quantity,
        p.ExpiryDate,
        DATEDIFF(p.ExpiryDate, CURDATE()) AS DaysRemaining
    FROM inventories i
    INNER JOIN products p ON p.ProductId = i.ProductId
    INNER JOIN branches b ON b.BranchId = i.BranchId
    WHERE p.IsDeleted = 0 AND p.IsActive = 1
      AND p.ExpiryDate IS NOT NULL
      AND p.ExpiryDate >= CURDATE()
      AND p.ExpiryDate <= DATE_ADD(CURDATE(), INTERVAL p_ThresholdDays DAY)
      AND i.Quantity > 0
      AND (p_BranchId IS NULL OR i.BranchId = p_BranchId)
    ORDER BY p.ExpiryDate ASC;
END$$

DELIMITER ;
