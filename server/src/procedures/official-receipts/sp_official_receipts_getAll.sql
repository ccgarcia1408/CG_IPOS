DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_official_receipts_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_official_receipts_getAll`()
BEGIN
    SELECT
	ofr.ORId,
	ofr.ORNo,
	ofr.Status,
	ofr.IsDeleted,
	ofr.DeletedBy,
	ofr.DateDeleted,
	ofr.CreatedAt,
	ofr.CreatedBy,
	ofr.UpdatedAt,
	ofr.UpdatedBy
    FROM official_receipts ofr
    WHERE ofr.IsDeleted = 0
    ;
END$$

DELIMITER ;