const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, categoryController.getCategories);
router.get("/active", authMiddleware, categoryController.getActiveCategories);
router.get("/:categoryId", authMiddleware, categoryController.getCategoryById);
router.post("/", authMiddleware, categoryController.createCategory);
router.put("/:categoryId", authMiddleware, categoryController.updateCategory);
router.delete("/:categoryId", authMiddleware, categoryController.deleteCategory);

module.exports = router;
