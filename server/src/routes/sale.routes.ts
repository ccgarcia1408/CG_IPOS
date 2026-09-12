import express from "express";
const router = express.Router();
import * as saleController from "../controllers/sale.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, saleController.getSales);
router.get("/:saleId", authMiddleware, saleController.getSaleById);
router.post("/", authMiddleware, saleController.completeSale);
router.post("/:saleId/void", authMiddleware, saleController.voidSale);
router.post("/items/:saleItemId/return", authMiddleware, saleController.returnItem);

export default router;
