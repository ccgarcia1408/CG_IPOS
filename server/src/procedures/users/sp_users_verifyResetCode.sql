DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_verifyResetCode`$$

-- Read-only check used both when the user lands via the emailed magic link and when they type
-- the code in manually -- does not consume the code, so the same code can still be used at the
-- final sp_users_resetPassword step.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_verifyResetCode`(
    IN `p_Email` VARCHAR(150),
    IN `p_ResetCode` VARCHAR(6)
)
BEGIN
    DECLARE v_UserId INT;
    DECLARE v_ResetCode VARCHAR(6);
    DECLARE v_ResetCodeExpiresAt DATETIME;

    SELECT UserId, ResetCode, ResetCodeExpiresAt
    INTO v_UserId, v_ResetCode, v_ResetCodeExpiresAt
    FROM users
    WHERE Email = p_Email
      AND IFNULL(IsDeleted, 0) = 0
    LIMIT 1;

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

    SELECT v_UserId AS UserId;
END$$

DELIMITER ;
