-- Many-to-many grant of branch access to a user, managed by an Administrator. A user with no
-- rows here (and RoleId <> 1) has no branch access anywhere -- enforcement fails closed.
-- Administrator (RoleId 1) bypasses this table entirely at the application layer and needs no
-- rows here.

CREATE TABLE IF NOT EXISTS user_branches (
    UserBranchId INT NOT NULL AUTO_INCREMENT,
    UserId INT NOT NULL,
    BranchId INT NOT NULL,
    IsDeleted TINYINT(1) NOT NULL DEFAULT 0,
    DeletedBy INT NULL,
    DateDeleted DATETIME NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT NULL,
    UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UpdatedBy INT NULL,
    IsActive TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (UserBranchId),
    UNIQUE KEY uq_user_branches_user_branch (UserId, BranchId),
    CONSTRAINT fk_user_branches_user FOREIGN KEY (UserId) REFERENCES users(UserId),
    CONSTRAINT fk_user_branches_branch FOREIGN KEY (BranchId) REFERENCES branches(BranchId)
) ENGINE=InnoDB;
