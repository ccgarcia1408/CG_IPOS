const express = require("express");
const router = express.Router();
const databaseMaintenanceController = require("../controllers/databaseMaintenance.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");

router.get("/", authMiddleware, requireAdmin, databaseMaintenanceController.getBackups);
router.post("/backup", authMiddleware, requireAdmin, databaseMaintenanceController.createBackup);
router.post("/restore", authMiddleware, requireAdmin, databaseMaintenanceController.restoreBackup);

module.exports = router;
