const express = require("express");
const router = express.Router();
const taxController = require("../controllers/tax.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, taxController.getTaxes);
router.get("/active", authMiddleware, taxController.getActiveTaxes);
router.get("/:taxId", authMiddleware, taxController.getTaxById);
router.post("/", authMiddleware, taxController.createTax);
router.put("/:taxId", authMiddleware, taxController.updateTax);
router.delete("/:taxId", authMiddleware, taxController.deleteTax);

module.exports = router;
