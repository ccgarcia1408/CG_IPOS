const crypto = require("crypto");
const bcrypt = require("bcrypt");

const UserModel = require("../models/user.model");
const MailerService = require("./mailer.service");
const ApiError = require("../utils/ApiError");

const RESET_CODE_TTL_MS = 15 * 60 * 1000;

// sp_users_setResetCode/verifyResetCode/resetPassword raise business errors via
// SIGNAL SQLSTATE '45000', which mysql2 surfaces as a generic Error (no statusCode).
// Same translation pattern as user.service.js.
const KNOWN_SIGNAL_STATUSES = {
    "No account found with that email address.": 404,
    "Invalid or expired code.": 400
};

function translateSignalError(error) {
    const statusCode = KNOWN_SIGNAL_STATUSES[error.sqlMessage || error.message];
    if (statusCode) {
        return new ApiError(statusCode, error.sqlMessage || error.message);
    }
    return error;
}

const generateResetCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, "0");

const ForgotPasswordService = {
    async requestReset(email) {
        const trimmedEmail = String(email || "").trim();
        if (!trimmedEmail) throw new ApiError(400, "Email is required.");

        const resetCode = generateResetCode();
        const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MS);

        let result;
        try {
            result = await UserModel.setResetCode(trimmedEmail, resetCode, expiresAt);
        } catch (error) {
            throw translateSignalError(error);
        }

        await MailerService.sendPasswordResetEmail(trimmedEmail, result.Username, resetCode);

        return { Message: "A password reset code has been sent to your email." };
    },

    async verifyCode(email, code) {
        const trimmedEmail = String(email || "").trim();
        const trimmedCode = String(code || "").trim();
        if (!trimmedEmail || !trimmedCode) throw new ApiError(400, "Email and code are required.");

        try {
            await UserModel.verifyResetCode(trimmedEmail, trimmedCode);
        } catch (error) {
            throw translateSignalError(error);
        }

        return { Message: "Code verified." };
    },

    async resetPassword(email, code, newPassword) {
        const trimmedEmail = String(email || "").trim();
        const trimmedCode = String(code || "").trim();
        if (!trimmedEmail || !trimmedCode) throw new ApiError(400, "Email and code are required.");
        if (!newPassword || newPassword.length < 8) throw new ApiError(400, "Password must be at least 8 characters.");

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        try {
            await UserModel.resetPassword(trimmedEmail, trimmedCode, hashedPassword);
        } catch (error) {
            throw translateSignalError(error);
        }

        return { Message: "Your password has been reset successfully." };
    }
};

module.exports = ForgotPasswordService;
