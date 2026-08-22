const ProductService = require("../services/products.service");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { uploadProductImage } = require("../middlewares/upload.middleware");

const getProducts = asyncHandler(async (req, res) => {
    const products = await ProductService.getProducts();

    res.status(200).json(
        new ApiResponse(200, "Products fetched successfully", products)
    );
});

const getActiveProducts = asyncHandler(async (req, res) => {
    const products = await ProductService.getActiveProducts();

    res.status(200).json(
        new ApiResponse(200, "Active products fetched successfully", products)
    );
});

const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const product = await ProductService.getProductById(productId);

    res.status(200).json(
        new ApiResponse(200, "Product fetched successfully", product)
    );
});

const createProduct = asyncHandler(async (req, res) => {
    const result = await ProductService.createProduct(
        req.body,
        req.user.UserId
    );

    res.status(201).json(
        new ApiResponse(
            201,
            result.Message,
            {
                ProductId: result.ProductId
            }
        )
    );
});

const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const result = await ProductService.updateProduct(
        productId,
        req.body,
        req.user.UserId
    );

    res.status(200).json(
        new ApiResponse(
            200,
            result.Message,
            null
        )
    );
});

const updateProductImage = asyncHandler(async (req, res, next) => {
    uploadProductImage(req, res, async (err) => {
        if (err) {
            return next(err.statusCode ? err : new ApiError(400, err.message));
        }

        try {
            const product = await ProductService.updateImage(req.params.productId, req.file, req.user.UserId);
            res.status(200).json(new ApiResponse(200, "Product image updated successfully", product));
        } catch (error) {
            next(error);
        }
    });
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const result = await ProductService.deleteProduct(
        productId,
        req.user.UserId
    );

    res.status(200).json(
        new ApiResponse(
            200,
            result.Message,
            null
        )
    );
});

module.exports = {
    getProducts,
    getActiveProducts,
    getProductById,
    createProduct,
    updateProduct,
    updateProductImage,
    deleteProduct
};