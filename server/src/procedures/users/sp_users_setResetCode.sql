DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_setResetCode`$$

-- Starts a password-reset request: stores a fresh 6-digit code + expiry on the user, replacing
-- any code from an earlier, unfinished request. Returns UserId/Username so the caller can build
-- the reset email without a second lookup.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_setResetCode`(
    IN `p_Email` VARCHAR(150),
    IN `p_ResetCode` VARCHAR(6),
    IN `p_ExpiresAt` DATETIME
)
BEGIN
    DECLARE v_UserId INT;
    DECLARE v_Username VARCHAR(100);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT UserId, Username
    INTO v_UserId, v_Username
    FROM users
    WHERE Email = p_Email
      AND IFNULL(IsDeleted, 0) = 0
    LIMIT 1;

    IF v_UserId IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No account found with that email address.';
    END IF;

    UPDATE users
    SET ResetCode = p_ResetCode,
        ResetCodeExpiresAt = p_ExpiresAt,
        UpdatedAt = NOW()
    WHERE UserId = v_UserId;

    INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
    VALUES (
        'UPDATE', 'Requested password reset code', 'users', v_UserId,
        NULL,
        JSON_OBJECT('Email', p_Email),
        v_UserId
    );

    COMMIT;

    SELECT v_UserId AS UserId, v_Username AS Username;
END$$

DELIMITER ;
