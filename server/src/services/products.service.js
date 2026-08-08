const ProductModel = require("../models/products.model");
const ApiError = require("../utils/ApiError");

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const positiveInteger = (value, label) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
        throw new ApiError(400, `${label} must be a positive whole number.`);
    }
    return number;
};

const nonNegativeNumber = (value, label, integerOnly = false) => {
    if (value === null || value === undefined || value === "") return null;

    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || (integerOnly && !Number.isInteger(number))) {
        throw new ApiError(400, `${label} must be a non-negative${integerOnly ? " whole" : ""} number.`);
    }
    return number;
};

const nullableText = (value) => {
    if (value === null || value === undefined) return null;
    return String(value).trim() || null;
};

const nullableDate = (value, label) => {
    if (value === null || value === undefined || value === "") return null;

    const date = String(value);
    const parsedDate = new Date(`${date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
        throw new ApiError(400, `${label} must be a valid date.`);
    }
    return date;
};

const activeFlag = (value) => {
    const number = Number(value);
    if (number !== 0 && number !== 1) throw new ApiError(400, "IsActive must be 0 or 1.");
    return number;
};

const validateDates = (manufacturingDate, expiryDate) => {
    if (manufacturingDate && expiryDate && String(expiryDate).slice(0, 10) < String(manufacturingDate).slice(0, 10)) {
        throw new ApiError(400, "ExpiryDate cannot be earlier than ManufacturingDate.");
    }
};

const ProductService = {
    async getProducts() {
        return await ProductModel.getAll();
    },

    async getActiveProducts() {
        return await ProductModel.getAllActive();
    },

    async getProductById(productId) {
        const product = await ProductModel.findById(positiveInteger(productId, "ProductId"));
        if (!product) throw new ApiError(404, "Product not found");
        return product;
    },

    async createProduct(data, userId) {
        const branchId = positiveInteger(data.BranchId, "BranchId");
        const categoryId = positiveInteger(data.CategoryId, "CategoryId");
        const name = nullableText(data.Name);
        if (!name) throw new ApiError(400, "Product name is required.");
        const sku = nullableText(data.SKU);
        const manufacturingDate = nullableDate(data.ManufacturingDate, "ManufacturingDate");
        const expiryDate = nullableDate(data.ExpiryDate, "ExpiryDate");
        validateDates(manufacturingDate, expiryDate);

        const result = await ProductModel.create(
            branchId,
            categoryId,
            name,
            nullableText(data.Description),
            nullableText(data.Barcode),
            sku,
            nonNegativeNumber(data.CostPrice, "CostPrice"),
            nonNegativeNumber(data.SellingPrice, "SellingPrice"),
            nonNegativeNumber(data.Stock, "Stock", true),
            nonNegativeNumber(data.MinimumStock, "MinimumStock", true),
            manufacturingDate,
            expiryDate,
            nullableText(data.ImagePath),
            userId
        );

        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async updateProduct(productId, data, userId) {
        const id = positiveInteger(productId, "ProductId");
        const existingProduct = await ProductModel.findById(id);
        if (!existingProduct) throw new ApiError(404, "Product not found");

        const branchId = hasOwn(data, "BranchId") ? positiveInteger(data.BranchId, "BranchId") : existingProduct.BranchId;
        const categoryId = hasOwn(data, "CategoryId") ? positiveInteger(data.CategoryId, "CategoryId") : existingProduct.CategoryId;
        const name = hasOwn(data, "Name") ? nullableText(data.Name) : existingProduct.Name;
        if (!name) throw new ApiError(400, "Product name is required.");
        const sku = hasOwn(data, "SKU") ? nullableText(data.SKU) : existingProduct.SKU;

        const manufacturingDate = hasOwn(data, "ManufacturingDate")
            ? nullableDate(data.ManufacturingDate, "ManufacturingDate")
            : existingProduct.ManufacturingDate;
        const expiryDate = hasOwn(data, "ExpiryDate")
            ? nullableDate(data.ExpiryDate, "ExpiryDate")
            : existingProduct.ExpiryDate;
        validateDates(manufacturingDate, expiryDate);

        const result = await ProductModel.update(
            id,
            branchId,
            categoryId,
            name,
            hasOwn(data, "Description") ? nullableText(data.Description) : existingProduct.Description,
            hasOwn(data, "Barcode") ? nullableText(data.Barcode) : existingProduct.Barcode,
            sku,
            hasOwn(data, "CostPrice") ? nonNegativeNumber(data.CostPrice, "CostPrice") : existingProduct.CostPrice,
            hasOwn(data, "SellingPrice") ? nonNegativeNumber(data.SellingPrice, "SellingPrice") : existingProduct.SellingPrice,
            hasOwn(data, "Stock") ? nonNegativeNumber(data.Stock, "Stock", true) : existingProduct.Stock,
            hasOwn(data, "MinimumStock") ? nonNegativeNumber(data.MinimumStock, "MinimumStock", true) : existingProduct.MinimumStock,
            manufacturingDate,
            expiryDate,
            hasOwn(data, "ImagePath") ? nullableText(data.ImagePath) : existingProduct.ImagePath,
            userId,
            hasOwn(data, "IsActive") ? activeFlag(data.IsActive) : existingProduct.IsActive
        );

        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async deleteProduct(productId, userId) {
        const id = positiveInteger(productId, "ProductId");
        const existingProduct = await ProductModel.findById(id);
        if (!existingProduct) throw new ApiError(404, "Product not found");

        const result = await ProductModel.delete(id, userId);
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    }
};

module.exports = ProductService;
