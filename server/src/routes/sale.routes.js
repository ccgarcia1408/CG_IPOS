const express = require("express");
const router = express.Router();
const saleController = require("../controllers/sale.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, saleController.getSales);
router.get("/:saleId", authMiddleware, saleController.getSaleById);
router.post("/", authMiddleware, saleController.completeSale);
router.post("/:saleId/void", authMiddleware, saleController.voidSale);
router.post("/items/:saleItemId/return", authMiddleware, saleController.returnItem);

module.exports = router;
