DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sales_completeSale`$$

-- Completes a POS checkout atomically: sale header + line items + stock validation/deduction +
-- inventory_logs + official receipt issuance, all in one transaction. Insufficient stock on ANY
-- line rolls back the whole sale — no partial checkouts. Price is looked up from
-- products.SellingPrice server-side (never trusted from the client) to prevent tampering.
--
-- p_Items is a JSON array: [{"ProductId":1,"Quantity":2,"Discount":0}, ...]. MariaDB 10.4 has
-- no JSON_TABLE, so line items are walked with JSON_VALUE in a WHILE loop instead.
--
-- The stock-deduction logic is inlined (not a CALL to sp_inventory_deductStock) for the same
-- reason sp_purchases_receive inlines its stock-increase logic: MySQL/MariaDB has no true
-- nested transactions, so calling another self-transacting procedure from here would silently
-- break atomicity.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sales_completeSale`(
    IN p_BranchId INT,
    IN p_TerminalId INT,
    IN p_CashierId INT,
    IN p_PaymentMethodId INT,
    IN p_Discount DECIMAL(18,2),
    IN p_Tax DECIMAL(18,2),
    IN p_AmountPaid DECIMAL(18,2),
    IN p_Items TEXT,
    IN p_CreatedBy INT
)
BEGIN
    DECLARE v_Success TINYINT DEFAULT 0;
    DECLARE v_Message VARCHAR(255) DEFAULT 'Failed to complete sale.';
    DECLARE v_SaleId INT DEFAULT NULL;
    DECLARE v_ItemCount INT DEFAULT 0;
    DECLARE i INT DEFAULT 0;

    DECLARE v_ProductId INT;
    DECLARE v_Quantity INT;
    DECLARE v_ItemDiscount DECIMAL(18,2);
    DECLARE v_Price DECIMAL(18,2);
    DECLARE v_LineTotal DECIMAL(18,2);
    DECLARE v_StockBefore INT;
    DECLARE v_StockAfter INT;
    DECLARE v_SubTotal DECIMAL(18,2) DEFAULT 0;
    DECLARE v_Total DECIMAL(18,2) DEFAULT 0;
    DECLARE v_ChangeAmount DECIMAL(18,2) DEFAULT 0;

    DECLARE v_ORAssignmentId INT;
    DECLARE v_ORFrom VARCHAR(50);
    DECLARE v_ORTo VARCHAR(50);
    DECLARE v_LastORUsed VARCHAR(50);
    DECLARE v_NextORNumeric BIGINT;
    DECLARE v_NextORNo VARCHAR(50);
    DECLARE v_ORId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to complete sale.' AS Message, NULL AS SaleId, NULL AS ORNo, NULL AS Total, NULL AS ChangeAmount;
    END;

    IF NOT EXISTS (SELECT 1 FROM branches WHERE BranchId = p_BranchId AND IsDeleted = 0 AND IsActive = 1) THEN
        SELECT 0 AS Success, 'Branch not found or inactive.' AS Message, NULL AS SaleId, NULL AS ORNo, NULL AS Total, NULL AS ChangeAmount;
    ELSEIF NOT EXISTS (SELECT 1 FROM terminals WHERE TerminalId = p_TerminalId AND BranchId = p_BranchId AND IsDeleted = 0 AND IsActive = 1) THEN
        SELECT 0 AS Success, 'Terminal not found, inactive, or does not belong to this branch.' AS Message, NULL AS SaleId, NULL AS ORNo, NULL AS Total, NULL AS ChangeAmount;
    ELSEIF NOT EXISTS (SELECT 1 FROM payment_methods WHERE PaymentMethodId = p_PaymentMethodId AND IsDeleted = 0 AND IsActive = 1) THEN
        SELECT 0 AS Success, 'Payment method not found or inactive.' AS Message, NULL AS SaleId, NULL AS ORNo, NULL AS Total, NULL AS ChangeAmount;
    ELSEIF p_Items IS NULL OR NOT JSON_VALID(p_Items) OR JSON_LENGTH(p_Items) = 0 THEN
        SELECT 0 AS Success, 'At least one line item is required.' AS Message, NULL AS SaleId, NULL AS ORNo, NULL AS Total, NULL AS ChangeAmount;
    ELSE
        SET v_ItemCount = JSON_LENGTH(p_Items);

        START TRANSACTION;

        -- Lock the cashier's active OR assignment for the duration of this sale so two
        -- concurrent checkouts by the same cashier can never be issued the same OR number.
        SELECT ORAssignmentId, ORFrom, ORTo, LastORUsed
        INTO v_ORAssignmentId, v_ORFrom, v_ORTo, v_LastORUsed
        FROM official_receipt_assignments
        WHERE UserId = p_CashierId
          AND IsDeleted = 0
          AND (LastORUsed IS NULL OR CAST(LastORUsed AS UNSIGNED) < CAST(ORTo AS UNSIGNED))
        ORDER BY CreatedAt DESC
        LIMIT 1
        FOR UPDATE;

        sale_block: BEGIN
            IF v_ORAssignmentId IS NULL THEN
                SET v_Message = 'No official receipt range assigned, or the assigned range is exhausted. Contact an administrator.';
                LEAVE sale_block;
            END IF;

            SET v_NextORNumeric = IF(v_LastORUsed IS NULL, CAST(v_ORFrom AS UNSIGNED), CAST(v_LastORUsed AS UNSIGNED) + 1);

            IF v_NextORNumeric > CAST(v_ORTo AS UNSIGNED) THEN
                SET v_Message = 'Official receipt range exhausted. Contact an administrator.';
                LEAVE sale_block;
            END IF;

            SET v_NextORNo = LPAD(v_NextORNumeric, CHAR_LENGTH(v_ORFrom), '0');

            -- HEADER (placeholder totals, finalized after the item loop)
            INSERT INTO sales (
                BranchId, TerminalId, CashierId, `Date`, SubTotal, Discount, Tax, Total,
                PaymentMethodId, AmountPaid, ChangeAmount, IsCancelled, IsDeleted, CreatedAt, CreatedBy
            )
            VALUES (
                p_BranchId, p_TerminalId, p_CashierId, CURDATE(), 0, IFNULL(p_Discount, 0), IFNULL(p_Tax, 0), 0,
                p_PaymentMethodId, p_AmountPaid, 0, 0, 0, NOW(), p_CreatedBy
            );

            SET v_SaleId = LAST_INSERT_ID();

            item_loop: WHILE i < v_ItemCount DO
                SET v_ProductId = CAST(JSON_VALUE(p_Items, CONCAT('$[', i, '].ProductId')) AS UNSIGNED);
                SET v_Quantity = CAST(JSON_VALUE(p_Items, CONCAT('$[', i, '].Quantity')) AS UNSIGNED);
                SET v_ItemDiscount = CAST(IFNULL(JSON_VALUE(p_Items, CONCAT('$[', i, '].Discount')), '0') AS DECIMAL(18,2));
                SET v_Price = NULL;
                SET v_StockBefore = NULL;

                IF v_ProductId IS NULL OR v_Quantity IS NULL OR v_Quantity <= 0 THEN
                    SET v_Message = CONCAT('Item ', i + 1, ': product and a positive quantity are required.');
                    LEAVE sale_block;
                END IF;

                SELECT SellingPrice INTO v_Price
                FROM products
                WHERE ProductId = v_ProductId AND IsDeleted = 0 AND IsActive = 1;

                IF v_Price IS NULL THEN
                    SET v_Message = CONCAT('Item ', i + 1, ': product not found or inactive.');
                    LEAVE sale_block;
                END IF;

                SELECT Quantity INTO v_StockBefore
                FROM inventories
                WHERE BranchId = p_BranchId AND ProductId = v_ProductId
                FOR UPDATE;

                IF v_StockBefore IS NULL THEN
                    SET v_Message = CONCAT('Item ', i + 1, ': no inventory record for this product at this branch.');
                    LEAVE sale_block;
                ELSEIF v_StockBefore < v_Quantity THEN
                    SET v_Message = CONCAT('Item ', i + 1, ': insufficient stock. Available: ', v_StockBefore, ', requested: ', v_Quantity, '.');
                    LEAVE sale_block;
                END IF;

                SET v_StockAfter = v_StockBefore - v_Quantity;

                UPDATE inventories
                SET Quantity = v_StockAfter
                WHERE BranchId = p_BranchId AND ProductId = v_ProductId;

                INSERT INTO inventory_logs (
                    BranchId, ProductId, TransactionType, ReferenceType, ReferenceId,
                    Remarks, Quantity, StockBefore, StockAfter, IsDeleted, CreatedAt, CreatedBy
                )
                VALUES (
                    p_BranchId, v_ProductId, 'DEDUCT', 'SALE', v_SaleId,
                    CONCAT('Sold via Sale #', v_SaleId), v_Quantity, v_StockBefore, v_StockAfter, 0, NOW(), p_CreatedBy
                );

                SET v_LineTotal = (v_Price * v_Quantity) - v_ItemDiscount;

                INSERT INTO sale_items (
                    SaleId, ProductId, Quantity, Price, Discount, Total, IsDeleted, CreatedAt, CreatedBy
                )
                VALUES (
                    v_SaleId, v_ProductId, v_Quantity, v_Price, v_ItemDiscount, v_LineTotal, 0, NOW(), p_CreatedBy
                );

                SET v_SubTotal = v_SubTotal + v_LineTotal;
                SET i = i + 1;
            END WHILE item_loop;

            SET v_Total = GREATEST(v_SubTotal - IFNULL(p_Discount, 0) + IFNULL(p_Tax, 0), 0);

            IF p_AmountPaid < v_Total THEN
                SET v_Message = CONCAT('Insufficient payment. Total: ', v_Total, ', paid: ', p_AmountPaid, '.');
                LEAVE sale_block;
            END IF;

            SET v_ChangeAmount = p_AmountPaid - v_Total;

            INSERT INTO official_receipts (ORNo, ORAssignmentId, Status, IsDeleted, CreatedAt, CreatedBy)
            VALUES (v_NextORNo, v_ORAssignmentId, 'ISSUED', 0, NOW(), p_CreatedBy);

            SET v_ORId = LAST_INSERT_ID();

            UPDATE official_receipt_assignments
            SET LastORUsed = v_NextORNo
            WHERE ORAssignmentId = v_ORAssignmentId;

            UPDATE sales
            SET SubTotal = v_SubTotal, Total = v_Total, ChangeAmount = v_ChangeAmount,
                ORId = v_ORId, ORNo = v_NextORNo, UpdatedAt = NOW(), UpdatedBy = p_CreatedBy
            WHERE SaleId = v_SaleId;

            INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
            VALUES (
                'CREATE', 'Completed sale', 'sales', v_SaleId,
                NULL,
                JSON_OBJECT('BranchId', p_BranchId, 'TerminalId', p_TerminalId, 'CashierId', p_CashierId, 'Total', v_Total, 'ORNo', v_NextORNo, 'ItemCount', v_ItemCount),
                p_CreatedBy
            );

            SET v_Success = 1;
            SET v_Message = 'Sale completed successfully.';
        END sale_block;

        IF v_Success = 1 THEN
            COMMIT;
            SELECT 1 AS Success, v_Message AS Message, v_SaleId AS SaleId, v_NextORNo AS ORNo, v_Total AS Total, v_ChangeAmount AS ChangeAmount;
        ELSE
            ROLLBACK;
            SELECT 0 AS Success, v_Message AS Message, NULL AS SaleId, NULL AS ORNo, NULL AS Total, NULL AS ChangeAmount;
        END IF;
    END IF;
END$$

DELIMITER ;
