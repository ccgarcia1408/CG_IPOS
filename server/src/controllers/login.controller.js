const LoginService = require("../services/login.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const login = asyncHandler(async (req, res) => {
  const { Username, Password } = req.body;

  const result = await LoginService.login(Username, Password);

  const message = result.requiresBranchSelection
    ? "Branch selection required"
    : "Login successful";

  res.status(200).json(new ApiResponse(200, message, result));
});

const selectBranch = asyncHandler(async (req, res) => {
  const { TenantId, BranchId } = req.body;

  const result = await LoginService.selectBranch(req.pendingUser.UserId, TenantId, BranchId);

  res.status(200).json(new ApiResponse(200, "Login successful", result));
});

module.exports = {
  login,
  selectBranch
};