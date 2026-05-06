DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_terminals_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_terminals_getAll`()
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
    WHERE t.IsDeleted = 0
    ;
END$$

DELIMITER ;