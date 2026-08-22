DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_returnReasons`$$

-- sale_returns.Reason is free text (no configured reason lookup table exists in this schema),
-- so this groups on the literal string rather than inventing a controlled vocabulary.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_returnReasons`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT
)
BEGIN
    SELECT
        COALESCE(NULLIF(TRIM(Reason), ''), 'Not specified') AS Reason,
        COUNT(*) AS ReturnCount,
        COALESCE(SUM(RefundAmount), 0) AS RefundAmount
    FROM sale_returns
    WHERE CreatedAt BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR BranchId = p_BranchId)
    GROUP BY Reason
    ORDER BY ReturnCount DESC;
END$$

DELIMITER ;
