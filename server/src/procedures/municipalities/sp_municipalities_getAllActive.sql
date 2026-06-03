DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_municipalities_getAllActive`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_municipalities_getAllActive`()
BEGIN
    SELECT
	m.MunicipalityId,
	m.ProvinceId,
	m.Name,
	m.IsDeleted,
	m.DeletedBy,
	m.DateDeleted,
	m.CreatedAt,
	m.CreatedBy,
	m.UpdatedAt,
	m.UpdatedBy,
	m.IsActive
    FROM municipalities m
    WHERE m.IsDeleted = 0
    AND m.IsActive = 1
    ;
END$$

DELIMITER ;