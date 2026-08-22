const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenant.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, tenantController.getTenants);
router.get("/active", authMiddleware, tenantController.getActiveTenants);
router.get("/:tenantId", authMiddleware, tenantController.getTenantById);
router.post("/", authMiddleware, tenantController.createTenant);
router.put("/:tenantId", authMiddleware, tenantController.updateTenant);
router.delete("/:tenantId", authMiddleware, tenantController.deleteTenant);

module.exports = router;
