import express from "express";
const router = express.Router();
import * as inventoryController from "../controllers/inventory.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, inventoryController.getInventory);
router.get("/movements", authMiddleware, inventoryController.getMovementHistory);
router.post("/receive", authMiddleware, inventoryController.receiveStock);
router.post("/adjust", authMiddleware, inventoryController.adjustStock);
router.put("/minimum-stock", authMiddleware, inventoryController.setMinimumStock);

export default router;
