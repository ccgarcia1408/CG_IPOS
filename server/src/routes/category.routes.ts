import express from "express";
const router = express.Router();
import * as categoryController from "../controllers/category.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, categoryController.getCategories);
router.get("/active", authMiddleware, categoryController.getActiveCategories);
router.get("/:categoryId", authMiddleware, categoryController.getCategoryById);
router.post("/", authMiddleware, categoryController.createCategory);
router.put("/:categoryId", authMiddleware, categoryController.updateCategory);
router.delete("/:categoryId", authMiddleware, categoryController.deleteCategory);

export default router;
