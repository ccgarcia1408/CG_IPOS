const DiscountService = require("../services/discount.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getDiscounts = asyncHandler(async (req, res) => {
    const discounts = await DiscountService.getDiscounts();

    res.status(200).json(
        new ApiResponse(200, "Discounts fetched successfully", discounts)
    );
});

const getActiveDiscounts = asyncHandler(async (req, res) => {
    const discounts = await DiscountService.getActiveDiscounts();

    res.status(200).json(
        new ApiResponse(200, "Active discounts fetched successfully", discounts)
    );
});

const getDiscountById = asyncHandler(async (req, res) => {
    const { discountId } = req.params;
    const discount = await DiscountService.getDiscountById(discountId);

    res.status(200).json(
        new ApiResponse(200, "Discount fetched successfully", discount)
    );
});

const createDiscount = asyncHandler(async (req, res) => {
    const result = await DiscountService.createDiscount(
        req.body,
        req.user.UserId
    );

    res.status(201).json(
        new ApiResponse(
            201,
            result.Message,
            {
                DiscountId: result.DiscountId
            }
        )
    );
});

const updateDiscount = asyncHandler(async (req, res) => {
    const { discountId } = req.params;

    const result = await DiscountService.updateDiscount(
        discountId,
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

const deleteDiscount = asyncHandler(async (req, res) => {
    const { discountId } = req.params;

    const result = await DiscountService.deleteDiscount(
        discountId,
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
    getDiscounts,
    getActiveDiscounts,
    getDiscountById,
    createDiscount,
    updateDiscount,
    deleteDiscount
};
