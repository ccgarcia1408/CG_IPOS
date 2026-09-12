import express from "express";
const router = express.Router();
import * as paymentMethodController from "../controllers/payment-method.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, paymentMethodController.getPaymentMethods);
router.get("/active", authMiddleware, paymentMethodController.getActivePaymentMethods);
router.get("/:paymentMethodId", authMiddleware, paymentMethodController.getPaymentMethodById);
router.post("/", authMiddleware, paymentMethodController.createPaymentMethod);
router.put("/:paymentMethodId", authMiddleware, paymentMethodController.updatePaymentMethod);
router.delete("/:paymentMethodId", authMiddleware, paymentMethodController.deletePaymentMethod);

export default router;