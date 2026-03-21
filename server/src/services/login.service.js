const LoginModel = require("../models/login.model");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const LoginService = {
    async login(username, password) {
        
        // FIND USER BY USERNAME
        const user = await LoginModel.findUserInfo(username);

        if (!user) {
            throw new ApiError(401, "Invalid username or password");
        }

        // COMPARE PASSWORDS
        const isMatch = await bcrypt.compare(password, user.Password);

        if (!isMatch) {
            throw new ApiError(401, "Invalid username or password");
        }

        // UPDATE LAST LOGIN DATE
        await LoginModel.updateLastLogin(username);

        // GENERATE JWT TOKEN
        const token = jwt.sign({ id: user.UserId }, process.env.JWT_SECRET, { expiresIn: "1h" });
        
        return {
            token,
            user: {
                UserId: user.UserId,
                RoleId: user.RoleId,
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
            }
        };
    }
};

module.exports = LoginService;