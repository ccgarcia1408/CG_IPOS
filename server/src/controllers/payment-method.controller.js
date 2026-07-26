const PaymentMethodService = require("../services/payment-method.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getPaymentMethods = asyncHandler(async (req, res) => {
    const paymentMethods = await PaymentMethodService.getPaymentMethods();

    res.status(200).json(
        new ApiResponse(200, "Payment methods fetched successfully", paymentMethods)
    );
});

const getActivePaymentMethods = asyncHandler(async (req, res) => {
    const paymentMethods = await PaymentMethodService.getActivePaymentMethods();

    res.status(200).json(
        new ApiResponse(200, "Active payment methods fetched successfully", paymentMethods)
    );
});

const getPaymentMethodById = asyncHandler(async (req, res) => {
    const { paymentMethodId } = req.params;
    const paymentMethod = await PaymentMethodService.getPaymentMethodById(paymentMethodId);

    res.status(200).json(
        new ApiResponse(200, "Payment method fetched successfully", paymentMethod)
    );
});

const createPaymentMethod = asyncHandler(async (req, res) => {
    const result = await PaymentMethodService.createPaymentMethod(
        req.body,
        req.user.UserId
    );

    res.status(201).json(
        new ApiResponse(
            201,
            result.Message,
            {
                PaymentMethodId: result.PaymentMethodId
            }
        )
    );
});

const updatePaymentMethod = asyncHandler(async (req, res) => {
    const { paymentMethodId } = req.params;

    const result = await PaymentMethodService.updatePaymentMethod(
        paymentMethodId,
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

const deletePaymentMethod = asyncHandler(async (req, res) => {
    const { paymentMethodId } = req.params;

    const result = await PaymentMethodService.deletePaymentMethod(
        paymentMethodId,
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
    getPaymentMethods,
    getActivePaymentMethods,
    getPaymentMethodById,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
};