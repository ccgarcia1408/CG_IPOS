DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_salesByTerminal`$$

-- Terminal-level aggregate. Deliberately omits a "Cashier"/"Status" column: terminals have no
-- UserId assignment at the schema level (confirmed -- a terminal isn't tied to one cashier),
-- and "status" (Open/Closed/Offline) needs cashier-shift session data that doesn't exist yet.
-- Both are known, already-flagged gaps -- not something to fake here.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_salesByTerminal`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT
)
BEGIN
    SELECT
        t.TerminalId,
        t.Name AS TerminalName,
        t.BranchId,
        b.Description AS BranchName,
        COALESCE(SUM(s.SubTotal), 0) AS Sales,
        COUNT(s.SaleId) AS Transactions,
        COALESCE((
            SELECT SUM(si.Quantity)
            FROM sale_items si
            INNER JOIN sales s2 ON s2.SaleId = si.SaleId
            WHERE si.IsDeleted = 0
              AND s2.IsCancelled = 0 AND s2.IsDeleted = 0
              AND s2.TerminalId = t.TerminalId
              AND s2.CreatedAt BETWEEN p_StartDate AND p_EndDate
        ), 0) AS ItemsSold
    FROM terminals t
    INNER JOIN branches b ON b.BranchId = t.BranchId
    LEFT JOIN sales s ON s.TerminalId = t.TerminalId
        AND s.IsCancelled = 0 AND s.IsDeleted = 0
        AND s.CreatedAt BETWEEN p_StartDate AND p_EndDate
    WHERE t.IsDeleted = 0
      AND (p_BranchId IS NULL OR t.BranchId = p_BranchId)
    GROUP BY t.TerminalId, t.Name, t.BranchId, b.Description
    ORDER BY Sales DESC;
END$$

DELIMITER ;
