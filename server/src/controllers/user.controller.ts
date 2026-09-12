import UserService from "../services/user.service";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { uploadProfilePicture } from "../middlewares/upload.middleware";

const createUser = asyncHandler(async (req, res) => {
  const user = await UserService.createUser(req.body, req.user?.UserId ?? null);
  res.status(201).json(new ApiResponse(201, "User created successfully", user));
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await UserService.getUsers();
  res.status(200).json(new ApiResponse(200, "Users retrieved successfully", users));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await UserService.getUserById(Number(req.params.id));
  res.status(200).json(new ApiResponse(200, "User retrieved successfully", user));
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await UserService.updateUser(Number(req.params.id), req.body, req.user.UserId);
  res.status(200).json(new ApiResponse(200, "User updated successfully", user));
});

const deleteUser = asyncHandler(async (req, res) => {
  await UserService.deleteUser(Number(req.params.id), req.user.UserId);
  res.status(200).json(new ApiResponse(200, "User deleted successfully"));
});

const updateProfilePicture = asyncHandler(async (req, res, next) => {
  uploadProfilePicture(req, res, async (err) => {
    if (err) {
      return next(err.statusCode ? err : new ApiError(400, err.message));
    }

    try {
      const user = await UserService.updateProfilePicture(Number(req.params.id), req.file, req.user.UserId);
      res.status(200).json(new ApiResponse(200, "Profile picture updated successfully", user));
    } catch (error) {
      next(error);
    }
  });
});

const getUserBranches = asyncHandler(async (req, res) => {
  const branches = await UserService.getUserBranches(Number(req.params.id));
  res.status(200).json(new ApiResponse(200, "User branches retrieved successfully", branches));
});

const updateUserBranches = asyncHandler(async (req, res) => {
  const result = await UserService.updateUserBranches(
    Number(req.params.id),
    req.body.BranchIds,
    req.user.UserId
  );
  res.status(200).json(new ApiResponse(200, result.Message, null));
});

export {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateProfilePicture,
  deleteUser,
  getUserBranches,
  updateUserBranches
};