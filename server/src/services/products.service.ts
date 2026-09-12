import fs from "fs";
import path from "path";
import ProductModel from "../models/products.model";
import ApiError from "../utils/ApiError";
import { PRODUCT_IMAGES_DIR } from "../middlewares/upload.middleware";

const hasOwn = (object: any, key: any) => Object.prototype.hasOwnProperty.call(object, key);

const rejectInventoryFields = (data: any) => {
    const forbidden = ["BranchId", "Stock", "MinimumStock"].filter((field) => hasOwn(data, field));
    if (forbidden.length) {
        throw new ApiError(400, `${forbidden.join(", ")} belongs to inventory and cannot be changed through Products.`);
    }
};

const positiveInteger = (value: any, label: any) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
        throw new ApiError(400, `${label} must be a positive whole number.`);
    }
    return number;
};

const nonNegativeNumber = (value: any, label: any, integerOnly = false) => {
    if (value === null || value === undefined || value === "") return null;

    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || (integerOnly && !Number.isInteger(number))) {
        throw new ApiError(400, `${label} must be a non-negative${integerOnly ? " whole" : ""} number.`);
    }
    return number;
};

const nullableText = (value: any) => {
    if (value === null || value === undefined) return null;
    return String(value).trim() || null;
};

const nullableDate = (value: any, label: any) => {
    if (value === null || value === undefined || value === "") return null;

    const date = String(value);
    const parsedDate = new Date(`${date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
        throw new ApiError(400, `${label} must be a valid date.`);
    }
    return date;
};

const activeFlag = (value: any) => {
    const number = Number(value);
    if (number !== 0 && number !== 1) throw new ApiError(400, "IsActive must be 0 or 1.");
    return number;
};

const validateDates = (manufacturingDate: any, expiryDate: any) => {
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

    async getProductById(productId: any) {
        const product = await ProductModel.findById(positiveInteger(productId, "ProductId"));
        if (!product) throw new ApiError(404, "Product not found");
        return product;
    },

    async createProduct(data: any, userId: any) {
        rejectInventoryFields(data);
        const categoryId = positiveInteger(data.CategoryId, "CategoryId");
        const name = nullableText(data.Name);
        if (!name) throw new ApiError(400, "Product name is required.");
        const sku = nullableText(data.SKU);
        const manufacturingDate = nullableDate(data.ManufacturingDate, "ManufacturingDate");
        const expiryDate = nullableDate(data.ExpiryDate, "ExpiryDate");
        validateDates(manufacturingDate, expiryDate);

        const result = await ProductModel.create(
            categoryId,
            name,
            nullableText(data.Description),
            nullableText(data.Barcode),
            sku,
            nonNegativeNumber(data.CostPrice, "CostPrice"),
            nonNegativeNumber(data.SellingPrice, "SellingPrice"),
            manufacturingDate,
            expiryDate,
            nullableText(data.ImagePath),
            userId
        );

        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async updateProduct(productId: any, data: any, userId: any) {
        rejectInventoryFields(data);
        const id = positiveInteger(productId, "ProductId");
        const existingProduct = await ProductModel.findById(id);
        if (!existingProduct) throw new ApiError(404, "Product not found");

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
            categoryId,
            name,
            hasOwn(data, "Description") ? nullableText(data.Description) : existingProduct.Description,
            hasOwn(data, "Barcode") ? nullableText(data.Barcode) : existingProduct.Barcode,
            sku,
            hasOwn(data, "CostPrice") ? nonNegativeNumber(data.CostPrice, "CostPrice") : existingProduct.CostPrice,
            hasOwn(data, "SellingPrice") ? nonNegativeNumber(data.SellingPrice, "SellingPrice") : existingProduct.SellingPrice,
            manufacturingDate,
            expiryDate,
            hasOwn(data, "ImagePath") ? nullableText(data.ImagePath) : existingProduct.ImagePath,
            userId,
            hasOwn(data, "IsActive") ? activeFlag(data.IsActive) : existingProduct.IsActive
        );

        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async updateImage(productId: any, file: Express.Multer.File | undefined, userId: any) {
        if (!file) throw new ApiError(400, "A product image file is required.");
        const id = positiveInteger(productId, "ProductId");
        const existingProduct = await ProductModel.findById(id);
        if (!existingProduct) {
            fs.unlink(file.path, () => {});
            throw new ApiError(404, "Product not found");
        }

        const newRelativePath = `/uploads/product-images/${file.filename}`;

        try {
            const result = await ProductModel.update(
                id,
                existingProduct.CategoryId,
                existingProduct.Name,
                existingProduct.Description,
                existingProduct.Barcode,
                existingProduct.SKU,
                existingProduct.CostPrice,
                existingProduct.SellingPrice,
                existingProduct.ManufacturingDate,
                existingProduct.ExpiryDate,
                newRelativePath,
                userId,
                existingProduct.IsActive
            );
            if (!result.Success) throw new ApiError(400, result.Message);
        } catch (error) {
            fs.unlink(file.path, () => {});
            throw error;
        }

        // Best-effort cleanup of the old file -- never block the response on this. Only
        // uploaded files live under PRODUCT_IMAGES_DIR; a plain URL in ImagePath is left alone.
        if (existingProduct.ImagePath && existingProduct.ImagePath.startsWith("/uploads/product-images/")) {
            fs.unlink(path.join(PRODUCT_IMAGES_DIR, path.basename(existingProduct.ImagePath)), () => {});
        }

        return await ProductModel.findById(id);
    },

    async deleteProduct(productId: any, userId: any) {
        const id = positiveInteger(productId, "ProductId");
        const existingProduct = await ProductModel.findById(id);
        if (!existingProduct) throw new ApiError(404, "Product not found");

        const result = await ProductModel.delete(id, userId);
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    }
};

export default ProductService;
