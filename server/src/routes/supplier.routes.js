const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, supplierController.getSuppliers);
router.get("/active", authMiddleware, supplierController.getActiveSuppliers);
router.get("/:supplierId", authMiddleware, supplierController.getSupplierById);
router.post("/", authMiddleware, supplierController.createSupplier);
router.put("/:supplierId", authMiddleware, supplierController.updateSupplier);
router.delete("/:supplierId", authMiddleware, supplierController.deleteSupplier);

module.exports = router;
