DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchases_create`$$

-- Creates a purchase order header only (Status='pending', TotalAmount=0). Line items are added
-- afterward via sp_purchase_items_create, which keeps TotalAmount in sync as each is added.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchases_create`(
    IN p_BranchId INT,
    IN p_SupplierId INT,
    IN p_PurchaseDate DATE,
    IN p_CreatedBy INT
)
BEGIN
    DECLARE v_PurchaseId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to create purchase.' AS Message, NULL AS PurchaseId;
    END;

    IF NOT EXISTS (SELECT 1 FROM branches WHERE BranchId = p_BranchId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Branch not found.' AS Message, NULL AS PurchaseId;
    ELSEIF NOT EXISTS (SELECT 1 FROM suppliers WHERE SupplierId = p_SupplierId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Supplier not found.' AS Message, NULL AS PurchaseId;
    ELSE
        START TRANSACTION;

        INSERT INTO purchases (
            BranchId, SupplierId, PurchaseDate, TotalAmount, Status, IsDeleted, CreatedAt, CreatedBy
        )
        VALUES (
            p_BranchId, p_SupplierId, IFNULL(p_PurchaseDate, CURDATE()), 0, 'pending', 0, NOW(), p_CreatedBy
        );

        SET v_PurchaseId = LAST_INSERT_ID();

        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
        VALUES (
            'CREATE', 'Created purchase order', 'purchases', v_PurchaseId,
            NULL,
            JSON_OBJECT('BranchId', p_BranchId, 'SupplierId', p_SupplierId, 'PurchaseDate', p_PurchaseDate, 'Status', 'pending'),
            p_CreatedBy
        );

        COMMIT;

        SELECT 1 AS Success, 'Purchase order created successfully.' AS Message, v_PurchaseId AS PurchaseId;
    END IF;
END$$

DELIMITER ;
