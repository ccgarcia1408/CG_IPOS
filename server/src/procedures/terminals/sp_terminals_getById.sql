DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_terminals_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_terminals_getById`(
    IN p_TerminalId INT
)
BEGIN

    SELECT
        t.TerminalId,
        t.Name,
        t.Description,
        t.IsDeleted,
        t.DeletedBy,
        t.DateDeleted,
        t.CreatedAt,
        t.CreatedBy,
        t.UpdatedAt,
        t.UpdatedBy,
        t.IsActive
    FROM terminals t
    WHERE t.TerminalId = p_TerminalId
    AND t.IsDeleted = 0
    LIMIT 1;

END$$

DELIMITER ;