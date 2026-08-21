DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sales_void`$$

-- Voids a completed sale: restores stock for every line item and marks the consumed OR as
-- VOIDED (never reissued — once printed, an OR number is retired for good, matching standard
-- receipt-accounting practice). One-way — a sale can only be voided once. Stock-restore logic
-- is inlined for the same nested-transaction reason as sp_sales_completeSale.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sales_void`(
    IN p_SaleId INT,
    IN p_Reason VARCHAR(255),
    IN p_VoidedBy INT
)
BEGIN
    DECLARE v_IsCancelled TINYINT DEFAULT NULL;
    DECLARE v_BranchId INT;
    DECLARE v_ORId INT;
    DECLARE v_Done INT DEFAULT 0;
    DECLARE v_ProductId INT;
    DECLARE v_Quantity INT;
    DECLARE v_StockBefore INT;
    DECLARE v_StockAfter INT;

    DECLARE cur CURSOR FOR
        SELECT ProductId, Quantity FROM sale_items WHERE SaleId = p_SaleId AND IsDeleted = 0;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_Done = 1;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to void sale.' AS Message;
    END;

    IF p_Reason IS NULL OR TRIM(p_Reason) = '' THEN
        SELECT 0 AS Success, 'A reason is required to void a sale.' AS Message;
    ELSE
        SELECT IsCancelled, BranchId, ORId INTO v_IsCancelled, v_BranchId, v_ORId
        FROM sales WHERE SaleId = p_SaleId AND IsDeleted = 0;

        IF v_IsCancelled IS NULL THEN
            SELECT 0 AS Success, 'Sale not found.' AS Message;
        ELSEIF v_IsCancelled = 1 THEN
            SELECT 0 AS Success, 'Sale is already voided.' AS Message;
        ELSE
            START TRANSACTION;

            OPEN cur;

            void_loop: LOOP
                FETCH cur INTO v_ProductId, v_Quantity;
                IF v_Done = 1 THEN
                    LEAVE void_loop;
                END IF;

                SELECT Quantity INTO v_StockBefore
                FROM inventories
                WHERE BranchId = v_BranchId AND ProductId = v_ProductId
                FOR UPDATE;

                SET v_StockAfter = IFNULL(v_StockBefore, 0) + v_Quantity;

                INSERT INTO inventories (BranchId, ProductId, Quantity, MinimumStock)
                VALUES (v_BranchId, v_ProductId, v_StockAfter, 0)
                ON DUPLICATE KEY UPDATE Quantity = v_StockAfter;

                INSERT INTO inventory_logs (
                    BranchId, ProductId, TransactionType, ReferenceType, ReferenceId,
                    Remarks, Quantity, StockBefore, StockAfter, IsDeleted, CreatedAt, CreatedBy
                )
                VALUES (
                    v_BranchId, v_ProductId, 'RECEIVE', 'SALE_VOID', p_SaleId,
                    CONCAT('Restored via void of Sale #', p_SaleId), v_Quantity, IFNULL(v_StockBefore, 0), v_StockAfter, 0, NOW(), p_VoidedBy
                );
            END LOOP;

            CLOSE cur;

            UPDATE sales
            SET IsCancelled = 1, CancelledBy = p_VoidedBy, DateCancelled = NOW(), CancelReason = p_Reason,
                UpdatedAt = NOW(), UpdatedBy = p_VoidedBy
            WHERE SaleId = p_SaleId;

            IF v_ORId IS NOT NULL THEN
                UPDATE official_receipts SET Status = 'VOIDED', UpdatedAt = NOW(), UpdatedBy = p_VoidedBy WHERE ORId = v_ORId;
            END IF;

            INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
            VALUES (
                'UPDATE', 'Voided sale', 'sales', p_SaleId,
                JSON_OBJECT('IsCancelled', 0), JSON_OBJECT('IsCancelled', 1, 'CancelReason', p_Reason), p_VoidedBy
            );

            COMMIT;

            SELECT 1 AS Success, 'Sale voided successfully.' AS Message;
        END IF;
    END IF;
END$$

DELIMITER ;
