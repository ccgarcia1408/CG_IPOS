const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchase.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, purchaseController.getPurchases);
router.get("/:purchaseId", authMiddleware, purchaseController.getPurchaseById);
router.post("/", authMiddleware, purchaseController.createPurchase);
router.post("/:purchaseId/items", authMiddleware, purchaseController.addItem);
router.delete("/items/:purchaseItemId", authMiddleware, purchaseController.deleteItem);
router.post("/:purchaseId/receive", authMiddleware, purchaseController.receivePurchase);
router.post("/:purchaseId/cancel", authMiddleware, purchaseController.cancelPurchase);
router.delete("/:purchaseId", authMiddleware, purchaseController.deletePurchase);

module.exports = router;
