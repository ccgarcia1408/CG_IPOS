const LoginService = require("../services/login.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const me = asyncHandler(async (req, res) => {
  const user = await LoginService.getCurrentUser(req.user.id);

  res.status(200).json(new ApiResponse(200, "User fetched successfully", user));
});

module.exports = {
  me,
};