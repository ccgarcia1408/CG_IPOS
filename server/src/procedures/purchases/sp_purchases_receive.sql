DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchases_receive`$$

-- Marks a pending purchase order as received and increases branch stock for every line item,
-- atomically. One-way transition (pending -> received only) — a receiving mistake is corrected
-- with a manual inventory adjustment afterward, not by reverting this status.
--
-- The stock-increase logic below is intentionally inlined rather than calling
-- sp_inventory_receiveStock per item: MySQL/MariaDB has no true nested transactions —
-- issuing START TRANSACTION while already inside one implicitly commits the outer transaction
-- first, which would silently break atomicity across the item loop. Keeping the whole receive
-- operation as plain statements inside ONE START TRANSACTION/COMMIT avoids that entirely.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchases_receive`(
    IN p_PurchaseId INT,
    IN p_ReceivedBy INT
)
BEGIN
    DECLARE v_Status VARCHAR(20) DEFAULT NULL;
    DECLARE v_BranchId INT;
    DECLARE v_Done INT DEFAULT 0;
    DECLARE v_ProductId INT;
    DECLARE v_Quantity INT;
    DECLARE v_StockBefore INT;
    DECLARE v_StockAfter INT;

    DECLARE cur CURSOR FOR
        SELECT ProductId, Quantity FROM purchase_items WHERE PurchaseId = p_PurchaseId AND IsDeleted = 0;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_Done = 1;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to receive purchase.' AS Message;
    END;

    SELECT Status, BranchId INTO v_Status, v_BranchId
    FROM purchases WHERE PurchaseId = p_PurchaseId AND IsDeleted = 0;

    IF v_Status IS NULL THEN
        SELECT 0 AS Success, 'Purchase order not found.' AS Message;
    ELSEIF v_Status <> 'pending' THEN
        SELECT 0 AS Success, CONCAT('Purchase order is already ', v_Status, '.') AS Message;
    ELSEIF NOT EXISTS (SELECT 1 FROM purchase_items WHERE PurchaseId = p_PurchaseId AND IsDeleted = 0) THEN
        SELECT 0 AS Success, 'Cannot receive a purchase order with no items.' AS Message;
    ELSE
        START TRANSACTION;

        OPEN cur;

        read_loop: LOOP
            FETCH cur INTO v_ProductId, v_Quantity;
            IF v_Done = 1 THEN
                LEAVE read_loop;
            END IF;

            INSERT INTO inventories (BranchId, ProductId, Quantity, MinimumStock)
            VALUES (v_BranchId, v_ProductId, 0, 0)
            ON DUPLICATE KEY UPDATE InventoryId = InventoryId;

            SELECT Quantity INTO v_StockBefore
            FROM inventories
            WHERE BranchId = v_BranchId AND ProductId = v_ProductId
            FOR UPDATE;

            SET v_StockAfter = v_StockBefore + v_Quantity;

            UPDATE inventories
            SET Quantity = v_StockAfter
            WHERE BranchId = v_BranchId AND ProductId = v_ProductId;

            INSERT INTO inventory_logs (
                BranchId, ProductId, TransactionType, ReferenceType, ReferenceId,
                Remarks, Quantity, StockBefore, StockAfter, IsDeleted, CreatedAt, CreatedBy
            )
            VALUES (
                v_BranchId, v_ProductId, 'RECEIVE', 'PURCHASE', p_PurchaseId,
                CONCAT('Received via Purchase #', p_PurchaseId), v_Quantity, v_StockBefore, v_StockAfter, 0, NOW(), p_ReceivedBy
            );
        END LOOP;

        CLOSE cur;

        UPDATE purchases
        SET Status = 'received', UpdatedAt = NOW(), UpdatedBy = p_ReceivedBy
        WHERE PurchaseId = p_PurchaseId;

        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
        VALUES (
            'UPDATE', 'Received purchase order', 'purchases', p_PurchaseId,
            JSON_OBJECT('Status', 'pending'), JSON_OBJECT('Status', 'received'), p_ReceivedBy
        );

        COMMIT;

        SELECT 1 AS Success, 'Purchase order received successfully.' AS Message;
    END IF;
END$$

DELIMITER ;
