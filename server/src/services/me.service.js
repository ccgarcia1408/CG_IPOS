const fs = require("fs");
const path = require("path");

const MeModel = require("../models/me.model");
const EmployeeModel = require("../models/employee.model");
const LoginService = require("./login.service");
const ApiError = require("../utils/ApiError");
const { PROFILE_PICTURES_DIR } = require("../middlewares/upload.middleware");

const MeService = {
    async updateProfilePicture(userId, file) {
        if (!file) {
            throw new ApiError(400, "A profile picture file is required.");
        }

        const newRelativePath = `/uploads/profile-pictures/${file.filename}`;
        const previousUser = await MeModel.getUserInfoById(userId);

        try {
            const result = await EmployeeModel.updateProfilePictureByUserId(
                userId,
                newRelativePath,
                userId
            );

            if (!result.Success) {
                throw new ApiError(400, result.Message);
            }
        } catch (error) {
            // Don't leave an orphaned upload behind if the DB update failed.
            fs.unlink(file.path, () => {});
            throw error;
        }

        // Best-effort cleanup of the old file -- never block the response on this.
        if (previousUser?.ProfilePicture) {
            const oldFilePath = path.join(
                PROFILE_PICTURES_DIR,
                path.basename(previousUser.ProfilePicture)
            );
            fs.unlink(oldFilePath, () => {});
        }

        return await LoginService.getCurrentUser(userId);
    }
};

module.exports = MeService;
