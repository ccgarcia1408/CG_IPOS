const ForgotPasswordService = require("../services/forgotPassword.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const requestReset = asyncHandler(async (req, res) => {
  const result = await ForgotPasswordService.requestReset(req.body.Email);
  res.status(200).json(new ApiResponse(200, result.Message, null));
});

const verifyCode = asyncHandler(async (req, res) => {
  const result = await ForgotPasswordService.verifyCode(req.body.Email, req.body.Code);
  res.status(200).json(new ApiResponse(200, result.Message, null));
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await ForgotPasswordService.resetPassword(req.body.Email, req.body.Code, req.body.NewPassword);
  res.status(200).json(new ApiResponse(200, result.Message, null));
});

module.exports = {
  requestReset,
  verifyCode,
  resetPassword
};
