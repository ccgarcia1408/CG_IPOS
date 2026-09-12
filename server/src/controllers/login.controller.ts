import LoginService from "../services/login.service";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

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

export {
  login,
  selectBranch
};