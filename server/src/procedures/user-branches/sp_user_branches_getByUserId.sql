DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_user_branches_getByUserId`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_user_branches_getByUserId`(
    IN p_UserId INT
)
BEGIN

    SELECT
        ub.UserBranchId,
        ub.BranchId,
        b.Description AS BranchName,
        b.TenantId,
        t.Name AS TenantName
    FROM user_branches ub
    INNER JOIN branches b ON ub.BranchId = b.BranchId
    INNER JOIN tenants t ON b.TenantId = t.TenantId
    WHERE ub.UserId = p_UserId
    AND ub.IsDeleted = 0
    AND ub.IsActive = 1
    AND b.IsDeleted = 0
    AND b.IsActive = 1
    ;

END$$

DELIMITER ;
