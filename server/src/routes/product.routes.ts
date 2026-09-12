import express from "express";
const router = express.Router();
import * as productsController from "../controllers/products.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, productsController.getProducts);
router.get("/active", authMiddleware, productsController.getActiveProducts);
router.get("/:productId", authMiddleware, productsController.getProductById);
router.post("/", authMiddleware, productsController.createProduct);
router.put("/:productId", authMiddleware, productsController.updateProduct);
router.put("/:productId/image", authMiddleware, productsController.updateProductImage);
router.delete("/:productId", authMiddleware, productsController.deleteProduct);

export default router;