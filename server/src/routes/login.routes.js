const express = require("express");
const router = express.Router();

const loginController = require("../controllers/login.controller");
const validate = require("../middlewares/validate.middleware");
const pendingAuthMiddleware = require("../middlewares/pendingAuth.middleware");
const { loginRateLimit } = require("../middlewares/authRateLimit.middleware");
const {
  loginSchema,
  selectBranchSchema
} = require("../validations/login.validation");

router.post("/", loginRateLimit, validate(loginSchema), loginController.login);
router.post("/select-branch", pendingAuthMiddleware, validate(selectBranchSchema), loginController.selectBranch);

module.exports = router;