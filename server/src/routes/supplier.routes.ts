import express from "express";
const router = express.Router();
import * as supplierController from "../controllers/supplier.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, supplierController.getSuppliers);
router.get("/active", authMiddleware, supplierController.getActiveSuppliers);
router.get("/:supplierId", authMiddleware, supplierController.getSupplierById);
router.post("/", authMiddleware, supplierController.createSupplier);
router.put("/:supplierId", authMiddleware, supplierController.updateSupplier);
router.delete("/:supplierId", authMiddleware, supplierController.deleteSupplier);

export default router;
