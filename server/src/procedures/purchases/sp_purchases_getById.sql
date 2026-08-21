DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchases_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchases_getById`(IN p_PurchaseId INT)
BEGIN
    SELECT
        p.PurchaseId,
        p.BranchId,
        b.Name AS BranchName,
        b.Description AS BranchDescription,
        p.SupplierId,
        s.SupplierName,
        p.PurchaseDate,
        p.TotalAmount,
        p.Status,
        p.CancelReason,
        p.CancelledBy,
        p.DateCancelled,
        p.CreatedAt,
        p.CreatedBy
    FROM purchases p
    INNER JOIN branches b ON b.BranchId = p.BranchId
    INNER JOIN suppliers s ON s.SupplierId = p.SupplierId
    WHERE p.PurchaseId = p_PurchaseId
      AND p.IsDeleted = 0
    LIMIT 1;
END$$

DELIMITER ;
