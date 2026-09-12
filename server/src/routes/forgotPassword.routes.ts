import express from "express";
const router = express.Router();

import * as forgotPasswordController from "../controllers/forgotPassword.controller";
import validate from "../middlewares/validate.middleware";
import {
  requestResetRateLimit,
  verifyResetCodeRateLimit
} from "../middlewares/authRateLimit.middleware";
import {
  requestResetSchema,
  verifyCodeSchema,
  resetPasswordSchema
} from "../validations/forgotPassword.validation";

router.post("/request", requestResetRateLimit, validate(requestResetSchema), forgotPasswordController.requestReset);
router.post("/verify-code", verifyResetCodeRateLimit, validate(verifyCodeSchema), forgotPasswordController.verifyCode);
router.post("/reset", validate(resetPasswordSchema), forgotPasswordController.resetPassword);

export default router;
