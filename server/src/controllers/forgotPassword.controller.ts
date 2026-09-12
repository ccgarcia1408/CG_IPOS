import ForgotPasswordService from "../services/forgotPassword.service";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

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

export {
  requestReset,
  verifyCode,
  resetPassword
};
