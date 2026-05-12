DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_branches_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_branches_getById`(
    IN p_BranchId INT
)
BEGIN

    SELECT
        b.BranchId,
        b.Name,
        b.Description,
        b.IsDeleted,
        b.DeletedBy,
        b.DateDeleted,
        b.CreatedAt,
        b.CreatedBy,
        b.UpdatedAt,
        b.UpdatedBy,
        b.IsActive
    FROM branches b
    WHERE b.BranchId = p_BranchId
    AND b.IsDeleted = 0
    LIMIT 1;

END$$

DELIMITER ;