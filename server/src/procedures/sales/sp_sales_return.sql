DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sales_return`$$

-- Records a partial (or full) return of one line item and restores the returned quantity to
-- stock. Independent of void: the original sale record is never touched, so it stays
-- historically accurate — a return is its own append-only ledger entry (sale_returns).
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sales_return`(
    IN p_SaleItemId INT,
    IN p_QuantityReturned INT,
    IN p_Reason VARCHAR(255),
    IN p_ProcessedBy INT
)
BEGIN
    DECLARE v_SaleId INT;
    DECLARE v_ProductId INT;
    DECLARE v_BranchId INT;
    DECLARE v_OriginalQuantity INT;
    DECLARE v_UnitNet DECIMAL(18,2);
    DECLARE v_AlreadyReturned INT DEFAULT 0;
    DECLARE v_IsCancelled TINYINT;
    DECLARE v_StockBefore INT;
    DECLARE v_StockAfter INT;
    DECLARE v_RefundAmount DECIMAL(18,2);
    DECLARE v_SaleReturnId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to process return.' AS Message;
    END;

    IF p_QuantityReturned IS NULL OR p_QuantityReturned <= 0 THEN
        SELECT 0 AS Success, 'Quantity returned must be a positive whole number.' AS Message;
    ELSEIF p_Reason IS NULL OR TRIM(p_Reason) = '' THEN
        SELECT 0 AS Success, 'A reason is required for a return.' AS Message;
    ELSE
        SELECT si.SaleId, si.ProductId, si.Quantity, (si.Price - si.Discount / NULLIF(si.Quantity, 0)), s.BranchId, s.IsCancelled
        INTO v_SaleId, v_ProductId, v_OriginalQuantity, v_UnitNet, v_BranchId, v_IsCancelled
        FROM sale_items si
        INNER JOIN sales s ON s.SaleId = si.SaleId
        WHERE si.SaleItemId = p_SaleItemId AND si.IsDeleted = 0;

        IF v_SaleId IS NULL THEN
            SELECT 0 AS Success, 'Sale item not found.' AS Message;
        ELSEIF v_IsCancelled = 1 THEN
            SELECT 0 AS Success, 'This sale was voided; the original transaction is already fully reversed.' AS Message;
        ELSE
            SELECT IFNULL(SUM(QuantityReturned), 0) INTO v_AlreadyReturned
            FROM sale_returns WHERE SaleItemId = p_SaleItemId;

            IF (v_AlreadyReturned + p_QuantityReturned) > v_OriginalQuantity THEN
                SELECT 0 AS Success, CONCAT('Cannot return ', p_QuantityReturned, '. Only ', (v_OriginalQuantity - v_AlreadyReturned), ' remaining returnable on this line.') AS Message;
            ELSE
                START TRANSACTION;

                SELECT Quantity INTO v_StockBefore
                FROM inventories
                WHERE BranchId = v_BranchId AND ProductId = v_ProductId
                FOR UPDATE;

                SET v_StockAfter = IFNULL(v_StockBefore, 0) + p_QuantityReturned;

                INSERT INTO inventories (BranchId, ProductId, Quantity, MinimumStock)
                VALUES (v_BranchId, v_ProductId, v_StockAfter, 0)
                ON DUPLICATE KEY UPDATE Quantity = v_StockAfter;

                INSERT INTO inventory_logs (
                    BranchId, ProductId, TransactionType, ReferenceType, ReferenceId,
                    Remarks, Quantity, StockBefore, StockAfter, IsDeleted, CreatedAt, CreatedBy
                )
                VALUES (
                    v_BranchId, v_ProductId, 'RECEIVE', 'SALE_RETURN', v_SaleId,
                    CONCAT('Returned from Sale #', v_SaleId, ': ', p_Reason), p_QuantityReturned, IFNULL(v_StockBefore, 0), v_StockAfter, 0, NOW(), p_ProcessedBy
                );

                SET v_RefundAmount = v_UnitNet * p_QuantityReturned;

                INSERT INTO sale_returns (SaleId, SaleItemId, ProductId, BranchId, QuantityReturned, RefundAmount, Reason, CreatedAt, CreatedBy)
                VALUES (v_SaleId, p_SaleItemId, v_ProductId, v_BranchId, p_QuantityReturned, v_RefundAmount, p_Reason, NOW(), p_ProcessedBy);

                SET v_SaleReturnId = LAST_INSERT_ID();

                INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
                VALUES (
                    'CREATE', 'Processed sale return', 'sale_returns', v_SaleReturnId,
                    NULL,
                    JSON_OBJECT('SaleId', v_SaleId, 'SaleItemId', p_SaleItemId, 'QuantityReturned', p_QuantityReturned, 'RefundAmount', v_RefundAmount, 'Reason', p_Reason),
                    p_ProcessedBy
                );

                COMMIT;

                SELECT 1 AS Success, 'Return processed successfully.' AS Message, v_SaleReturnId AS SaleReturnId, v_RefundAmount AS RefundAmount;
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;
