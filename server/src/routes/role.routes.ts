import express from "express";
const router = express.Router();
import * as roleController from "../controllers/role.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, roleController.getRoles);
router.get("/active", authMiddleware, roleController.getActiveRoles);
router.get("/:roleId", authMiddleware, roleController.getRoleById);

export default router;
