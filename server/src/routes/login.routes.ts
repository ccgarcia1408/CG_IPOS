import express from "express";
const router = express.Router();

import * as loginController from "../controllers/login.controller";
import validate from "../middlewares/validate.middleware";
import pendingAuthMiddleware from "../middlewares/pendingAuth.middleware";
import { loginRateLimit } from "../middlewares/authRateLimit.middleware";
import {
  loginSchema,
  selectBranchSchema
} from "../validations/login.validation";

router.post("/", loginRateLimit, validate(loginSchema), loginController.login);
router.post("/select-branch", pendingAuthMiddleware, validate(selectBranchSchema), loginController.selectBranch);

export default router;