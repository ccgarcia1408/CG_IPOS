import express from "express";
const router = express.Router();
import * as discountController from "../controllers/discount.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, discountController.getDiscounts);
router.get("/active", authMiddleware, discountController.getActiveDiscounts);
router.get("/:discountId", authMiddleware, discountController.getDiscountById);
router.post("/", authMiddleware, discountController.createDiscount);
router.put("/:discountId", authMiddleware, discountController.updateDiscount);
router.delete("/:discountId", authMiddleware, discountController.deleteDiscount);

export default router;
