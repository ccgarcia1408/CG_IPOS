const express = require("express");
const router = express.Router();

const forgotPasswordController = require("../controllers/forgotPassword.controller");
const validate = require("../middlewares/validate.middleware");
const {
  requestResetSchema,
  verifyCodeSchema,
  resetPasswordSchema
} = require("../validations/forgotPassword.validation");

router.post("/request", validate(requestResetSchema), forgotPasswordController.requestReset);
router.post("/verify-code", validate(verifyCodeSchema), forgotPasswordController.verifyCode);
router.post("/reset", validate(resetPasswordSchema), forgotPasswordController.resetPassword);

module.exports = router;
