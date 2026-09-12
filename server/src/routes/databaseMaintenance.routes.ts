import express from "express";
const router = express.Router();
import * as databaseMaintenanceController from "../controllers/databaseMaintenance.controller";
import authMiddleware from "../middlewares/auth.middleware";
import requireAdmin from "../middlewares/requireAdmin.middleware";

router.get("/", authMiddleware, requireAdmin, databaseMaintenanceController.getBackups);
router.post("/backup", authMiddleware, requireAdmin, databaseMaintenanceController.createBackup);
router.post("/restore", authMiddleware, requireAdmin, databaseMaintenanceController.restoreBackup);

export default router;
