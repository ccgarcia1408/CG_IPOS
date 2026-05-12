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

module.exports = {
    getCategories,
    getActiveCategories,
};