import express from "express";
const router = express.Router();
import * as tenantController from "../controllers/tenant.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, tenantController.getTenants);
router.get("/active", authMiddleware, tenantController.getActiveTenants);
router.get("/:tenantId", authMiddleware, tenantController.getTenantById);
router.post("/", authMiddleware, tenantController.createTenant);
router.put("/:tenantId", authMiddleware, tenantController.updateTenant);
router.delete("/:tenantId", authMiddleware, tenantController.deleteTenant);

export default router;
