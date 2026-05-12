const CategoryModel = require("../models/category.model");

const CategoryService = {
    async getCategories() {
        return await CategoryModel.getAll();
    },

    async getActiveCategories() {
        return await CategoryModel.getAllActive();
    }
};

module.exports = CategoryService;