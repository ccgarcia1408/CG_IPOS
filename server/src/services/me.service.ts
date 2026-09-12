import fs from "fs";
import path from "path";

import MeModel from "../models/me.model";
import EmployeeModel from "../models/employee.model";
import LoginService from "./login.service";
import UserService from "./user.service";
import ApiError from "../utils/ApiError";
import { PROFILE_PICTURES_DIR } from "../middlewares/upload.middleware";

const MeService = {
    // updateMeSchema only ever lets FirstName/MiddleName/LastName/Email/Age/Address/ContactNo
    // through -- RoleId/IsActive/IsAccountVerified/Username/Password are never present in `data`,
    // so UserService.updateUser's existing merge (`data.X ?? existingUser.X`) leaves every
    // admin-only field untouched. Reuses the same tested update path User Maintenance uses
    // instead of duplicating its merge/uniqueness-check logic here.
    async updateProfile(userId: any, data: any) {
        await UserService.updateUser(userId, data, userId);
        return await LoginService.getCurrentUser(userId);
    },


    async updateProfilePicture(userId: any, file: Express.Multer.File | undefined) {
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

export default MeService;
