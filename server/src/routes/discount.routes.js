const express = require("express");
const router = express.Router();
const discountController = require("../controllers/discount.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, discountController.getDiscounts);
router.get("/active", authMiddleware, discountController.getActiveDiscounts);
router.get("/:discountId", authMiddleware, discountController.getDiscountById);
router.post("/", authMiddleware, discountController.createDiscount);
router.put("/:discountId", authMiddleware, discountController.updateDiscount);
router.delete("/:discountId", authMiddleware, discountController.deleteDiscount);

module.exports = router;
