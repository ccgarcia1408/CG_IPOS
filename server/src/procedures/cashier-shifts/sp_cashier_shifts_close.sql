DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_cashier_shifts_close`$$

-- ExpectedCash = OpeningCash + cash sales completed during the shift's open window
-- (payment_methods.IsCash = 1). sales.Total is used, not AmountPaid: for a fully-tendered
-- sale, AmountPaid - ChangeAmount == Total, so Total is exactly the net cash the drawer
-- gained regardless of how much was tendered/changed. Voided sales (IsCancelled=1) are
-- excluded, which is correct -- the cash for a voided sale nets to zero. Returns are NOT
-- subtracted: sale_returns has no refund-method column, so there's no reliable way to know if
-- a given return was refunded in cash vs. store credit -- a known, deliberate simplification,
-- not an oversight.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cashier_shifts_close`(
    IN p_CashierShiftId INT,
    IN p_ClosingCashierId INT,
    IN p_ClosingCash DECIMAL(10,2),
    IN p_UpdatedBy INT
)
BEGIN
    DECLARE v_CashierId INT;
    DECLARE v_BranchId INT;
    DECLARE v_TerminalId INT;
    DECLARE v_OpeningCash DECIMAL(10,2);
    DECLARE v_OpenedAt DATETIME;
    DECLARE v_Status VARCHAR(10);
    DECLARE v_CashSales DECIMAL(10,2) DEFAULT 0;
    DECLARE v_ExpectedCash DECIMAL(10,2) DEFAULT 0;
    DECLARE v_Variance DECIMAL(10,2) DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to close shift.' AS Message;
    END;

    IF p_ClosingCash IS NULL OR p_ClosingCash < 0 THEN
        SELECT 0 AS Success, 'Actual cash must be a non-negative amount.' AS Message;
    ELSE
        START TRANSACTION;

        SELECT CashierId, BranchId, TerminalId, OpeningCash, OpenedAt, Status
        INTO v_CashierId, v_BranchId, v_TerminalId, v_OpeningCash, v_OpenedAt, v_Status
        FROM cashier_shifts
        WHERE CashierShiftId = p_CashierShiftId AND IsDeleted = 0
        FOR UPDATE;

        IF v_CashierId IS NULL THEN
            ROLLBACK;
            SELECT 0 AS Success, 'Shift not found.' AS Message;
        ELSEIF v_Status <> 'OPEN' THEN
            ROLLBACK;
            SELECT 0 AS Success, 'This shift is already closed.' AS Message;
        ELSEIF v_CashierId <> p_ClosingCashierId THEN
            ROLLBACK;
            SELECT 0 AS Success, 'Only the cashier who opened this shift can close it.' AS Message;
        ELSE
            SELECT COALESCE(SUM(s.Total), 0) INTO v_CashSales
            FROM sales s
            INNER JOIN payment_methods pm ON pm.PaymentMethodId = s.PaymentMethodId
            WHERE s.CashierId = v_CashierId
              AND s.BranchId = v_BranchId
              AND s.TerminalId = v_TerminalId
              AND s.IsCancelled = 0 AND s.IsDeleted = 0
              AND pm.IsCash = 1
              AND s.CreatedAt >= v_OpenedAt;

            SET v_ExpectedCash = v_OpeningCash + v_CashSales;
            SET v_Variance = p_ClosingCash - v_ExpectedCash;

            UPDATE cashier_shifts
            SET Status = 'CLOSED',
                ClosingCash = p_ClosingCash,
                ExpectedCash = v_ExpectedCash,
                Variance = v_Variance,
                ClosedAt = NOW(),
                UpdatedAt = NOW(),
                UpdatedBy = p_UpdatedBy
            WHERE CashierShiftId = p_CashierShiftId;

            INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
            VALUES (
                'UPDATE', 'Closed cashier shift', 'cashier_shifts', p_CashierShiftId,
                JSON_OBJECT('Status', 'OPEN', 'OpeningCash', v_OpeningCash),
                JSON_OBJECT('Status', 'CLOSED', 'ClosingCash', p_ClosingCash, 'ExpectedCash', v_ExpectedCash, 'Variance', v_Variance),
                p_UpdatedBy
            );

            COMMIT;

            SELECT
                1 AS Success,
                'Shift closed successfully.' AS Message,
                v_ExpectedCash AS ExpectedCash,
                v_Variance AS Variance;
        END IF;
    END IF;
END$$

DELIMITER ;
