DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_cashier_shifts_open`$$

-- Enforces "one active shift per cashier" and "one active shift per terminal" via row locks
-- (SELECT ... FOR UPDATE) inside a transaction, the same concurrency-safety pattern
-- sp_sales_completeSale uses for OR assignment locking -- prevents a race where two concurrent
-- "Open Shift" clicks both pass the EXISTS check before either INSERT commits.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cashier_shifts_open`(
    IN p_CashierId INT,
    IN p_BranchId INT,
    IN p_TerminalId INT,
    IN p_OpeningCash DECIMAL(10,2),
    IN p_CreatedBy INT
)
BEGIN
    DECLARE v_ExistingCashierShift INT DEFAULT NULL;
    DECLARE v_ExistingTerminalShift INT DEFAULT NULL;
    DECLARE v_CashierShiftId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to open shift.' AS Message, NULL AS CashierShiftId;
    END;

    IF p_OpeningCash IS NULL OR p_OpeningCash < 0 THEN
        SELECT 0 AS Success, 'Opening cash must be a non-negative amount.' AS Message, NULL AS CashierShiftId;
    ELSEIF NOT EXISTS (SELECT 1 FROM terminals WHERE TerminalId = p_TerminalId AND BranchId = p_BranchId AND IsDeleted = 0 AND IsActive = 1) THEN
        SELECT 0 AS Success, 'Terminal not found, inactive, or does not belong to this branch.' AS Message, NULL AS CashierShiftId;
    ELSE
        START TRANSACTION;

        SELECT CashierShiftId INTO v_ExistingCashierShift
        FROM cashier_shifts
        WHERE CashierId = p_CashierId AND Status = 'OPEN' AND IsDeleted = 0
        FOR UPDATE;

        SELECT CashierShiftId INTO v_ExistingTerminalShift
        FROM cashier_shifts
        WHERE TerminalId = p_TerminalId AND Status = 'OPEN' AND IsDeleted = 0
        FOR UPDATE;

        IF v_ExistingCashierShift IS NOT NULL THEN
            ROLLBACK;
            SELECT 0 AS Success, 'You already have an open shift. Close it before opening another.' AS Message, NULL AS CashierShiftId;
        ELSEIF v_ExistingTerminalShift IS NOT NULL THEN
            ROLLBACK;
            SELECT 0 AS Success, 'This terminal already has an open shift.' AS Message, NULL AS CashierShiftId;
        ELSE
            INSERT INTO cashier_shifts (
                CashierId, BranchId, TerminalId, Status, OpeningCash, OpenedAt,
                IsDeleted, CreatedAt, CreatedBy
            )
            VALUES (
                p_CashierId, p_BranchId, p_TerminalId, 'OPEN', p_OpeningCash, NOW(),
                0, NOW(), p_CreatedBy
            );

            SET v_CashierShiftId = LAST_INSERT_ID();

            INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
            VALUES (
                'CREATE', 'Opened cashier shift', 'cashier_shifts', v_CashierShiftId,
                NULL,
                JSON_OBJECT('CashierId', p_CashierId, 'BranchId', p_BranchId, 'TerminalId', p_TerminalId, 'OpeningCash', p_OpeningCash),
                p_CreatedBy
            );

            COMMIT;

            SELECT 1 AS Success, 'Shift opened successfully.' AS Message, v_CashierShiftId AS CashierShiftId;
        END IF;
    END IF;
END$$

DELIMITER ;
