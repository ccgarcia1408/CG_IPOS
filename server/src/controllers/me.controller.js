const LoginService = require("../services/login.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const me = asyncHandler(async (req, res) => {
  const user = await LoginService.getCurrentUser(req.user.UserId);

  res.status(200).json(new ApiResponse(200, "User fetched successfully", user));
});

const logout = asyncHandler(async (req, res) => {
  await LoginService.logout(req.user.Username);

  res.status(200).json(new ApiResponse(200, "Logged out successfully", null));
});

module.exports = {
  me,
  logout,
};