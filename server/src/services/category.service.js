const CategoryModel = require("../models/category.model");
const ApiError = require("../utils/ApiError");

const CategoryService = {
    async getCategories() {
        return await CategoryModel.getAll();
    },

    async getActiveCategories() {
        return await CategoryModel.getAllActive();
    },

    async getCategoryById(categoryId) {
        const category = await CategoryModel.findById(categoryId);

        if (!category) {
            throw new ApiError(404, "Category not found");
        }
        
        return category;
    },

    async createCategory(data, userId) {
        const { BranchId, Name, Description } = data;

        if (!BranchId) throw new ApiError(400, "Branch is required.");
        if (!Name?.trim()) throw new ApiError(400, "Category name is required.");

        const result = await CategoryModel.create(BranchId, Name.trim(), Description?.trim() || null, userId);

        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async updateCategory(categoryId, data, userId) {
        const existingCategory = await CategoryModel.findById(categoryId);
        if (!existingCategory) throw new ApiError(404, "Category not found");

        const result = await CategoryModel.update(
            categoryId,
            data.BranchId ?? existingCategory.BranchId,
            data.Name?.trim() || existingCategory.Name,
            data.Description?.trim() || null,
            userId,
            data.IsActive ?? existingCategory.IsActive
        );

        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async deleteCategory(categoryId, userId) {
        const existingCategory = await CategoryModel.findById(categoryId);
        if (!existingCategory) throw new ApiError(404, "Category not found");

        const result = await CategoryModel.delete(categoryId, userId);
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },
};

module.exports = CategoryService;
