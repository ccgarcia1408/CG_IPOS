DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_recentActivity`$$

-- audit_logs has no BranchId of its own (it covers everything from sales to tenants to user
-- management), so this has no branch filter -- dashboard.service.js restricts this endpoint to
-- Administrator only, matching the ticket's own rule that non-admin dashboards shouldn't expose
-- administrative/system-wide activity.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_recentActivity`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_Limit INT
)
BEGIN
    SELECT
        al.AuditLogId,
        al.CreatedAt,
        al.ActionType,
        al.Action,
        al.TableName,
        al.RecordId,
        CONCAT(e.FirstName, ' ', e.LastName) AS UserName
    FROM audit_logs al
    LEFT JOIN users u ON u.UserId = al.CreatedBy
    LEFT JOIN employees e ON e.EmployeeId = u.EmployeeId
    WHERE al.CreatedAt BETWEEN p_StartDate AND p_EndDate
    ORDER BY al.CreatedAt DESC
    LIMIT p_Limit;
END$$

DELIMITER ;
