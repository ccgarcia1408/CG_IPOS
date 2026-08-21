const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, inventoryController.getInventory);
router.get("/movements", authMiddleware, inventoryController.getMovementHistory);
router.post("/receive", authMiddleware, inventoryController.receiveStock);
router.post("/adjust", authMiddleware, inventoryController.adjustStock);
router.put("/minimum-stock", authMiddleware, inventoryController.setMinimumStock);

module.exports = router;
