DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_roles_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_roles_getById`(
    IN p_RoleId INT
)
BEGIN

    SELECT
        r.RoleId,
        r.Name,
        r.Description,
        r.IsDeleted,
        r.DeletedBy,
        r.DateDeleted,
        r.CreatedAt,
        r.CreatedBy,
        r.UpdatedAt,
        r.UpdatedBy,
        r.IsActive
    FROM roles r
    WHERE r.RoleId = p_RoleId
    AND r.IsDeleted = 0
    LIMIT 1;

END$$

DELIMITER ;