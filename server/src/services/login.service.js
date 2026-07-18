const LoginModel = require("../models/login.model");
const MeModel = require("../models/me.model");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

        const token = jwt.sign(
            { UserId: user.UserId },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return {
            token,
            user: mapUser(user)
        };
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