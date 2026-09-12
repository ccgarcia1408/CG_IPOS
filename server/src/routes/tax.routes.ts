import express from "express";
const router = express.Router();
import * as taxController from "../controllers/tax.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, taxController.getTaxes);
router.get("/active", authMiddleware, taxController.getActiveTaxes);
router.get("/:taxId", authMiddleware, taxController.getTaxById);
router.post("/", authMiddleware, taxController.createTax);
router.put("/:taxId", authMiddleware, taxController.updateTax);
router.delete("/:taxId", authMiddleware, taxController.deleteTax);

export default router;
