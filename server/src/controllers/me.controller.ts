import LoginService from "../services/login.service";
import MeService from "../services/me.service";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { uploadProfilePicture } from "../middlewares/upload.middleware";

const me = asyncHandler(async (req, res) => {
  const user = await LoginService.getCurrentUser(req.user.UserId);

  res.status(200).json(new ApiResponse(200, "User fetched successfully", user));
});

const logout = asyncHandler(async (req, res) => {
  await LoginService.logout(req.user.Username);

  res.status(200).json(new ApiResponse(200, "Logged out successfully", null));
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await MeService.updateProfile(req.user.UserId, req.body);
  res.status(200).json(new ApiResponse(200, "Profile updated successfully", user));
});

const updateProfilePicture = asyncHandler(async (req, res, next) => {
  uploadProfilePicture(req, res, async (err) => {
    if (err) {
      // Normalize multer's own errors (e.g. LIMIT_FILE_SIZE) to a 400 instead of a bare 500.
      return next(err.statusCode ? err : new ApiError(400, err.message));
    }

    try {
      const user = await MeService.updateProfilePicture(req.user.UserId, req.file);
      res.status(200).json(new ApiResponse(200, "Profile picture updated successfully", user));
    } catch (error) {
      next(error);
    }
  });
});

export {
  me,
  logout,
  updateProfile,
  updateProfilePicture,
};