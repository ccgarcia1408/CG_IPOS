const UserService = require("../services/user.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

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

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};