const CategoryModel = require("../models/category.model");

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
};

module.exports = CategoryService;