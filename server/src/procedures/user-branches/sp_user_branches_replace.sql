DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_user_branches_replace`$$

-- Replaces the full set of branches granted to a user in one transaction. p_BranchIds is a
-- JSON array of BranchId integers (e.g. '[1,2,3]'), following sp_sales_completeSale's
-- JSON-array + WHILE-loop precedent -- MariaDB 10.4 here has no JSON_TABLE, so there's no
-- bulk-insert alternative in this codebase. An empty array ('[]') is valid and revokes all
-- branch access for the user.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_user_branches_replace`(
    IN p_UserId INT,
    IN p_BranchIds TEXT,
    IN p_UpdatedBy INT
)
BEGIN
    DECLARE v_BranchCount INT DEFAULT 0;
    DECLARE v_InvalidCount INT DEFAULT 0;
    DECLARE i INT DEFAULT 0;
    DECLARE v_BranchId INT;
    DECLARE v_OldValue JSON;
    DECLARE v_CheckBranchId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to update user branch access.' AS Message;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM users
        WHERE UserId = p_UserId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'User not found.' AS Message;

    ELSEIF p_BranchIds IS NULL OR NOT JSON_VALID(p_BranchIds) THEN

        SELECT
            0 AS Success,
            'BranchIds must be a valid JSON array.' AS Message;

    ELSE

        SET v_BranchCount = JSON_LENGTH(p_BranchIds);

        -- VALIDATE EVERY BRANCH ID EXISTS AND IS ACTIVE BEFORE CHANGING ANYTHING
        -- (no JSON_TABLE in this codebase -- MariaDB 10.4 doesn't support it; see
        -- sp_sales_completeSale for the same WHILE-loop precedent)
        WHILE i < v_BranchCount DO
            SET v_CheckBranchId = CAST(JSON_VALUE(p_BranchIds, CONCAT('$[', i, ']')) AS UNSIGNED);

            IF NOT EXISTS (
                SELECT 1 FROM branches
                WHERE BranchId = v_CheckBranchId AND IsDeleted = 0 AND IsActive = 1
            ) THEN
                SET v_InvalidCount = v_InvalidCount + 1;
            END IF;

            SET i = i + 1;
        END WHILE;

        SET i = 0;

        IF v_BranchCount > 0 AND v_InvalidCount > 0 THEN

            SELECT
                0 AS Success,
                'One or more selected branches are invalid or inactive.' AS Message;

        ELSE

            START TRANSACTION;

            -- JSON_ARRAYAGG isn't available in this MariaDB version; build the JSON array
            -- manually via GROUP_CONCAT instead (audit-log snapshot only, not used for logic).
            SELECT CONCAT('[', COALESCE(GROUP_CONCAT(BranchId), ''), ']') INTO v_OldValue
            FROM user_branches
            WHERE UserId = p_UserId AND IsDeleted = 0 AND IsActive = 1;

            UPDATE user_branches
            SET IsDeleted = 1,
                DeletedBy = p_UpdatedBy,
                DateDeleted = NOW(),
                UpdatedAt = NOW(),
                UpdatedBy = p_UpdatedBy
            WHERE UserId = p_UserId
            AND IsDeleted = 0;

            WHILE i < v_BranchCount DO
                SET v_BranchId = CAST(JSON_VALUE(p_BranchIds, CONCAT('$[', i, ']')) AS UNSIGNED);

                INSERT INTO user_branches (
                    UserId,
                    BranchId,
                    IsDeleted,
                    CreatedAt,
                    CreatedBy,
                    IsActive
                )
                VALUES (
                    p_UserId,
                    v_BranchId,
                    0,
                    NOW(),
                    p_UpdatedBy,
                    1
                )
                ON DUPLICATE KEY UPDATE
                    IsDeleted = 0,
                    DeletedBy = NULL,
                    DateDeleted = NULL,
                    IsActive = 1,
                    UpdatedAt = NOW(),
                    UpdatedBy = p_UpdatedBy;

                SET i = i + 1;
            END WHILE;

            INSERT INTO audit_logs (
                ActionType,
                `Action`,
                TableName,
                RecordId,
                OldValue,
                NewValue,
                CreatedBy
            )
            VALUES (
                'UPDATE',
                'Replaced user branch access',
                'user_branches',
                p_UserId,
                JSON_OBJECT('BranchIds', COALESCE(v_OldValue, JSON_ARRAY())),
                JSON_OBJECT('BranchIds', p_BranchIds),
                p_UpdatedBy
            );

            COMMIT;

            SELECT
                1 AS Success,
                'User branch access updated successfully.' AS Message;

        END IF;

    END IF;

END$$

DELIMITER ;
