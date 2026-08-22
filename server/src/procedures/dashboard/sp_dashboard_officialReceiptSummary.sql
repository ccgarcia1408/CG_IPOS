DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_officialReceiptSummary`$$

-- official_receipts has no BranchId of its own -- rows are only ever created inside
-- sp_sales_completeSale (Status='ISSUED') and flipped to 'VOIDED' by sp_sales_void, so branch
-- scoping goes through the linked sale. There is no pre-populated 'AVAILABLE' pool of rows in
-- this schema (confirmed: nothing inserts that status) -- "available" numbers are a function of
-- the assignment range, handled separately by sp_dashboard_orAssignmentStatus.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_officialReceiptSummary`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT
)
BEGIN
    SELECT
        COALESCE(SUM(CASE WHEN o.Status = 'ISSUED' THEN 1 ELSE 0 END), 0) AS IssuedCount,
        COALESCE(SUM(CASE WHEN o.Status = 'VOIDED' THEN 1 ELSE 0 END), 0) AS VoidedCount
    FROM official_receipts o
    LEFT JOIN sales s ON s.ORId = o.ORId
    WHERE o.IsDeleted = 0
      AND o.CreatedAt BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR s.BranchId = p_BranchId);
END$$

DELIMITER ;
