const CategoryService = require("../services/category.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getCategories = asyncHandler(async (req, res) => {
    const categories = await CategoryService.getCategories();

    res.status(200).json(
        new ApiResponse(200, "Categories fetched successfully", categories)
    );
});

const getActiveCategories = asyncHandler(async (req, res) => {
    const categories = await CategoryService.getActiveCategories();

    res.status(200).json(
        new ApiResponse(200, "Active categories fetched successfully", categories)
    );
});

const getCategoryById = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const category = await CategoryService.getCategoryById(categoryId);

    res.status(200).json(
        new ApiResponse(200, "Category fetched successfully", category)
    );
});

const createCategory = asyncHandler(async (req, res) => {
    const result = await CategoryService.createCategory(req.body, req.user.UserId);
    res.status(201).json(new ApiResponse(201, result.Message, { CategoryId: result.CategoryId }));
});

const updateCategory = asyncHandler(async (req, res) => {
    const result = await CategoryService.updateCategory(req.params.categoryId, req.body, req.user.UserId);
    res.status(200).json(new ApiResponse(200, result.Message, null));
});

const deleteCategory = asyncHandler(async (req, res) => {
    const result = await CategoryService.deleteCategory(req.params.categoryId, req.user.UserId);
    res.status(200).json(new ApiResponse(200, result.Message, null));
});

module.exports = {
    getCategories,
    getActiveCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
