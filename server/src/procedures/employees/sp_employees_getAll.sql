DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_employees_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_employees_getAll`()
BEGIN
    SELECT
	e.EmployeeId,
	e.FirstName,
	e.MiddleName,
	e.LastName,
	e.Address,
	e.Age,
	e.ContactNo,
	e.DateHired,
	e.IsResigned,
	e.DateResigned,
	e.IsDeleted,
	e.DeletedBy,
	e.DateDeleted,
	e.CreatedAt,
	e.CreatedBy,
	e.UpdatedAt,
	e.UpdatedBy
    FROM employees e
    WHERE e.IsDeleted = 0
    ;
END$$

DELIMITER ;