const express = require("express");
const router = express.Router();
const paymentMethodController = require("../controllers/payment-method.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, paymentMethodController.getPaymentMethods);
router.get("/active", authMiddleware, paymentMethodController.getActivePaymentMethods);
router.get("/:paymentMethodId", authMiddleware, paymentMethodController.getPaymentMethodById);
router.post("/", authMiddleware, paymentMethodController.createPaymentMethod);
router.put("/:paymentMethodId", authMiddleware, paymentMethodController.updatePaymentMethod);
router.delete("/:paymentMethodId", authMiddleware, paymentMethodController.deletePaymentMethod);

module.exports = router;