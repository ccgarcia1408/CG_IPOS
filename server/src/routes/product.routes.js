const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, productsController.getProducts);
router.get("/:productId", authMiddleware, productsController.getProductById);
router.get("/active", authMiddleware, productsController.getActiveProducts);
router.post("/", authMiddleware, productsController.createProduct);
router.put("/:productId", authMiddleware, productsController.updateProduct);
router.delete("/:productId", authMiddleware, productsController.deleteProduct);

module.exports = router;