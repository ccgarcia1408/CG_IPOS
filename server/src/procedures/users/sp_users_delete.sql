DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_users_delete`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_delete`(
    IN `p_UserId` INT, 
    IN `p_DeletedBy` INT
)
BEGIN
    DECLARE v_RowCount INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- DELETE USER BY SETTING IsDeleted FLAG TO 1
    UPDATE users
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
    WHERE UserId = p_UserId
    AND IFNULL(IsDeleted, 0) = 0;

    SET v_RowCount = ROW_COUNT();

    IF v_RowCount = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User not found or already deleted.';
    END IF;

    COMMIT;
        SELECT p_UserId AS UserId;
END$$

DELIMITER ;