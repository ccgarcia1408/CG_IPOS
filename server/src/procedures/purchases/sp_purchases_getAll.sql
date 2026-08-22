DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchases_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchases_getAll`(IN p_BranchId INT)
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
        p.CreatedBy,
        (SELECT COUNT(*) FROM purchase_items pi WHERE pi.PurchaseId = p.PurchaseId AND pi.IsDeleted = 0) AS ItemCount
    FROM purchases p
    INNER JOIN branches b ON b.BranchId = p.BranchId
    INNER JOIN suppliers s ON s.SupplierId = p.SupplierId
    WHERE p.IsDeleted = 0
      AND (p_BranchId IS NULL OR p.BranchId = p_BranchId)
    ORDER BY p.CreatedAt DESC, p.PurchaseId DESC;
END$$

DELIMITER ;
