import express from "express";
const router = express.Router();

import * as MeController from "../controllers/me.controller";
import authMiddleware from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import { updateMeSchema } from "../validations/me.validation";

router.get("/me", authMiddleware, MeController.me);
router.put("/me", authMiddleware, validate(updateMeSchema), MeController.updateProfile);
router.put("/me/profile-picture", authMiddleware, MeController.updateProfilePicture);
router.post("/logout", authMiddleware, MeController.logout);

export default router;