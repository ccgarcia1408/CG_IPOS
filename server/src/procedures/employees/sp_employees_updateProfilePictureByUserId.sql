DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_employees_updateProfilePictureByUserId`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_employees_updateProfilePictureByUserId`(
    IN p_UserId INT,
    IN p_ProfilePicture VARCHAR(255),
    IN p_UpdatedBy INT
)
BEGIN
    DECLARE v_EmployeeId INT;
    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to update profile picture.' AS Message;
    END;

    SELECT EmployeeId INTO v_EmployeeId
    FROM users
    WHERE UserId = p_UserId
      AND IsDeleted = 0
    LIMIT 1;

    IF v_EmployeeId IS NULL THEN

        SELECT
            0 AS Success,
            'User not found.' AS Message;

    ELSE

        START TRANSACTION;

        SELECT JSON_OBJECT('ProfilePicture', ProfilePicture) INTO v_OldValue
        FROM employees
        WHERE EmployeeId = v_EmployeeId;

        UPDATE employees
        SET
            ProfilePicture = p_ProfilePicture,
            UpdatedAt = NOW(),
            UpdatedBy = p_UpdatedBy
        WHERE EmployeeId = v_EmployeeId;

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
            'Updated profile picture',
            'employees',
            v_EmployeeId,
            v_OldValue,
            JSON_OBJECT('ProfilePicture', p_ProfilePicture),
            p_UpdatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'Profile picture updated successfully.' AS Message;

    END IF;

END$$

DELIMITER ;
