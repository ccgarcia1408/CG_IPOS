DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_resetPassword`$$

-- Final step: re-validates the code (never trust that the client-side "code verified" state is
-- still accurate -- the code could have expired between steps), sets the new password hash, and
-- clears the code so it cannot be replayed.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_resetPassword`(
    IN `p_Email` VARCHAR(150),
    IN `p_ResetCode` VARCHAR(6),
    IN `p_NewPasswordHash` VARCHAR(255)
)
BEGIN
    DECLARE v_UserId INT;
    DECLARE v_ResetCode VARCHAR(6);
    DECLARE v_ResetCodeExpiresAt DATETIME;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT UserId, ResetCode, ResetCodeExpiresAt
    INTO v_UserId, v_ResetCode, v_ResetCodeExpiresAt
    FROM users
    WHERE Email = p_Email
      AND IFNULL(IsDeleted, 0) = 0
    LIMIT 1
    FOR UPDATE;

    IF v_UserId IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No account found with that email address.';
    ELSEIF v_ResetCode IS NULL OR v_ResetCode <> p_ResetCode THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid or expired code.';
    ELSEIF v_ResetCodeExpiresAt IS NULL OR v_ResetCodeExpiresAt < NOW() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid or expired code.';
    END IF;

    UPDATE users
    SET `Password` = p_NewPasswordHash,
        ResetCode = NULL,
        ResetCodeExpiresAt = NULL,
        IsPasswordChanged = 1,
        PasswordChangeDate = NOW(),
        UpdatedAt = NOW(),
        UpdatedBy = v_UserId
    WHERE UserId = v_UserId;

    INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
    VALUES (
        'UPDATE', 'Reset password via forgot-password flow', 'users', v_UserId,
        NULL,
        JSON_OBJECT('Email', p_Email),
        v_UserId
    );

    COMMIT;

    SELECT v_UserId AS UserId;
END$$

DELIMITER ;
