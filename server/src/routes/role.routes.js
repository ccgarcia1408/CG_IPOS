const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, roleController.getRoles);
router.get("/active", authMiddleware, roleController.getActiveRoles);
router.get("/:roleId", authMiddleware, roleController.getRoleById);

module.exports = router;
