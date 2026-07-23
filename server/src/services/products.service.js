const ProductModel = require("../models/products.model");
const ApiError = require("../utils/ApiError");

const ProductService = {
    async getProducts() {
        return await ProductModel.getAll();
    },

    async getActiveProducts() {
        return await ProductModel.getAllActive();
    },

    async getProductById(productId) {
        const product = await ProductModel.findById(productId);

        if (!product) {
            throw new ApiError(404, "Product not found");
        }
        
        return product;
    },

    async createProduct(data, userId) {
        const { BranchId, CategoryId, Name, Description, Barcode, CostPrice, SellingPrice, Stock, MinimumStock, ImagePath } = data;

        if (!Name) {
            throw new ApiError(400, "Product name is required.");
        }

        const result = await ProductModel.create(
            BranchId,
            CategoryId,
            Name,
            Description ?? null,
            Barcode ?? null,
            CostPrice ?? null,
            SellingPrice ?? null,
            Stock ?? null,
            MinimumStock ?? null,
            ImagePath ?? null,
            userId
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        console.log("ProductService.createProduct result:", data, result);

        return result;
    },

    async updateProduct(productId, data, userId) {
        const {
            BranchId,
            CategoryId,
            Name,
            Description,
            Barcode,
            CostPrice,
            SellingPrice,
            Stock,
            MinimumStock,
            ImagePath,
            IsActive
        } = data;

        const existingProduct = await ProductModel.findById(productId);

        if (!existingProduct) {
            throw new ApiError(404, "Product not found");
        }

        const result = await ProductModel.update(
            productId,
            BranchId ?? existingProduct.BranchId,
            CategoryId ?? existingProduct.CategoryId,
            Name ?? existingProduct.Name,
            Description ?? existingProduct.Description,
            Barcode ?? existingProduct.Barcode,
            CostPrice ?? existingProduct.CostPrice,
            SellingPrice ?? existingProduct.SellingPrice,
            Stock ?? existingProduct.Stock,
            MinimumStock ?? existingProduct.MinimumStock,
            ImagePath ?? existingProduct.ImagePath,
            userId,
            IsActive ?? existingProduct.IsActive
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async deleteProduct(productId, userId) {
        const result = await ProductModel.delete(
            productId,
            userId
        );          

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    }

};

module.exports = ProductService;