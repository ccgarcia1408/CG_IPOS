const LoginModel = require("../models/login.model");
const MeModel = require("../models/me.model");
const UserModel = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Administrator bypasses tenant/branch scoping entirely -- confirmed convention across this
// codebase's migrations (e.g. "Administrator (RoleId 1) sees every menu... needs no explicit
// grant").
const ADMIN_ROLE_ID = 1;
const PENDING_TOKEN_EXPIRES_IN = "5m";

const mapUser = (user) => ({
    UserId: user.UserId,
    RoleId: user.RoleId,
    RoleName: user.RoleName,
    EmployeeId: user.EmployeeId,
    Username: user.Username,
    Email: user.Email,
    LastLoginDate: user.LastLoginDate,
    LastLogoutDate: user.LastLogoutDate,
    IsPasswordChanged: user.IsPasswordChanged,
    PasswordChangedDate: user.PasswordChangedDate,
    IsAccountVerified: user.IsAccountVerified,
    AccountVerifiedDate: user.AccountVerifiedDate,
    IsDeleted: user.IsDeleted,
    DeletedBy: user.DeletedBy,
    DateDeleted: user.DateDeleted,
    CreatedAt: user.CreatedAt,
    IsActive: user.IsActive,
    FirstName: user.FirstName,
    MiddleName: user.MiddleName,
    LastName: user.LastName,
    Address: user.Address,
    Age: user.Age,
    ContactNo: user.ContactNo,
    ProfilePicture: user.ProfilePicture,
    DateHired: user.DateHired,
    IsResigned: user.IsResigned
});

const LoginService = {
    async login(username, password) {
        const user = await LoginModel.getUserInfo(username);

        if (!user) {
            throw new ApiError(401, "Invalid username or password");
        }

        const isMatch = await bcrypt.compare(password, user.Password);

        if (!isMatch) {
            throw new ApiError(401, "Invalid username or password");
        }

        if (user.IsAccountVerified === 0) {
            throw new ApiError(403, "Your account is not yet verified.");
        }

        if (user.IsActive === 0) {
            throw new ApiError(403, "Your account is inactive.");
        }

        await LoginModel.updateLastLogin(username);

        // Administrator bypasses tenant/branch selection -- issue a full session token
        // immediately, exactly as before this feature existed.
        if (Number(user.RoleId) === ADMIN_ROLE_ID) {
            const token = jwt.sign(
                { UserId: user.UserId, Username: user.Username, RoleId: user.RoleId },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
            );

            return {
                token,
                user: mapUser(user)
            };
        }

        // Everyone else must pick which branch they're working at for this session. Issue a
        // short-lived pending token (rejected by authMiddleware on every normal protected
        // route) that only the select-branch endpoint accepts.
        const assignedBranches = await UserModel.getBranches(user.UserId);

        const tenantsById = new Map();
        for (const branch of assignedBranches) {
            if (!tenantsById.has(branch.TenantId)) {
                tenantsById.set(branch.TenantId, { TenantId: branch.TenantId, TenantName: branch.TenantName });
            }
        }

        const pendingToken = jwt.sign(
            {
                UserId: user.UserId,
                Username: user.Username,
                RoleId: user.RoleId,
                Scope: "PENDING_BRANCH_SELECTION"
            },
            process.env.JWT_SECRET,
            { expiresIn: PENDING_TOKEN_EXPIRES_IN }
        );

        return {
            requiresBranchSelection: true,
            pendingToken,
            tenants: Array.from(tenantsById.values()),
            branches: assignedBranches.map((branch) => ({
                BranchId: branch.BranchId,
                BranchName: branch.BranchName,
                TenantId: branch.TenantId
            }))
        };
    },

    async selectBranch(pendingUserId, tenantId, branchId) {
        const assignedBranches = await UserModel.getBranches(pendingUserId);

        const isAuthorized = assignedBranches.some(
            (branch) => Number(branch.BranchId) === Number(branchId) && Number(branch.TenantId) === Number(tenantId)
        );

        if (!isAuthorized) {
            throw new ApiError(403, "You are not authorized for the selected branch.");
        }

        const user = await MeModel.getUserInfoById(pendingUserId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const token = jwt.sign(
            {
                UserId: user.UserId,
                Username: user.Username,
                RoleId: user.RoleId,
                TenantId: Number(tenantId),
                BranchId: Number(branchId)
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
        );

        return {
            token,
            user: mapUser(user)
        };
    },

    async logout(username) {
        if (username) {
            await LoginModel.updateLastLogout(username);
        }
    },

    async getCurrentUser(userId) {
        const user = await MeModel.getUserInfoById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.IsActive === 0) {
            throw new ApiError(403, "Your account is inactive.");
        }

        if (user.IsDeleted === 1) {
            throw new ApiError(403, "Your account is no longer available.");
        }

        return mapUser(user);
    }
};

module.exports = LoginService;

// const LoginModel = require("../models/login.model");
// const ApiError = require("../utils/ApiError");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const LoginService = {
//     async login(username, password) {
        
//         // FIND USER BY USERNAME
//         const user = await LoginModel.getUserInfo(username);

//         if (!user) {
//             throw new ApiError(401, "Invalid username or password");
//         }

//         // COMPARE PASSWORDS
//         const isMatch = await bcrypt.compare(password, user.Password);

//         if (!isMatch) {
//             throw new ApiError(401, "Invalid username or password");
//         }

//         if (user.IsActive === 0) {
//             throw new ApiError(403, "Your account is inactive.");
//         }

//         // UPDATE LAST LOGIN DATE
//         await LoginModel.updateLastLogin(username);

//         // GENERATE JWT TOKEN
//         const token = jwt.sign({ id: user.UserId }, process.env.JWT_SECRET, { expiresIn: "1h" });
        
//         return {
//             token,
//             user: {
//                 UserId: user.UserId,
//                 RoleId: user.RoleId,
//                 RoleName: user.RoleName,
//                 EmployeeId: user.EmployeeId,
//                 Username: user.Username,
//                 Email: user.Email,
//                 LastLoginDate: user.LastLoginDate,
//                 LastLogoutDate: user.LastLogoutDate,
//                 IsPasswordChanged: user.IsPasswordChanged,
//                 PasswordChangedDate: user.PasswordChangedDate,
//                 IsAccountVerified: user.IsAccountVerified,
//                 AccountVerifiedDate: user.AccountVerifiedDate,
//                 IsDeleted: user.IsDeleted,
//                 DeletedBy: user.DeletedBy,
//                 DateDeleted: user.DateDeleted,
//                 CreatedAt: user.CreatedAt,
//                 IsActive: user.IsActive,
//                 FirstName: user.FirstName,
//                 MiddleName: user.MiddleName,
//                 LastName: user.LastName,
//                 Address: user.Address,
//                 Age: user.Age,
//                 ContactNo: user.ContactNo,
//                 DateHired: user.DateHired,
//                 IsResigned: user.IsResigned
//             }
//         };
//     }
// };

// module.exports = LoginService;