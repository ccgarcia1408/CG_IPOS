import express from "express";
const router = express.Router();
import * as purchaseController from "../controllers/purchase.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, purchaseController.getPurchases);
router.get("/:purchaseId", authMiddleware, purchaseController.getPurchaseById);
router.post("/", authMiddleware, purchaseController.createPurchase);
router.post("/:purchaseId/items", authMiddleware, purchaseController.addItem);
router.delete("/items/:purchaseItemId", authMiddleware, purchaseController.deleteItem);
router.post("/:purchaseId/receive", authMiddleware, purchaseController.receivePurchase);
router.post("/:purchaseId/cancel", authMiddleware, purchaseController.cancelPurchase);
router.delete("/:purchaseId", authMiddleware, purchaseController.deletePurchase);

export default router;
