const PaymentMethodModel = require("../models/payment-method.model");
const ApiError = require("../utils/ApiError");

const PaymentMethodService = {
    async getPaymentMethods() {
        return await PaymentMethodModel.getAll();
    },

    async getActivePaymentMethods() {
        return await PaymentMethodModel.getAllActive();
    },

    async getPaymentMethodById(paymentMethodId) {
        const paymentMethod = await PaymentMethodModel.findById(paymentMethodId);

        if (!paymentMethod) {
            throw new ApiError(404, "Payment method not found");
        }

        return paymentMethod;
    },

    async createPaymentMethod(data, userId) {
        const { Name, Description } = data;

        if (!Name) {
            throw new ApiError(400, "Payment method name is required.");
        }

        const result = await PaymentMethodModel.create(
            Name,
            Description ?? null,
            userId
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async updatePaymentMethod(paymentMethodId, data, userId) {
        const {
            Name,
            Description,
            IsActive
        } = data;

        const existingPaymentMethod = await PaymentMethodModel.findById(paymentMethodId);

        if (!existingPaymentMethod) {
            throw new ApiError(404, "Payment method not found");
        }

        const result = await PaymentMethodModel.update(
            paymentMethodId,
            Name ?? existingPaymentMethod.Name,
            Description ?? existingPaymentMethod.Description,
            userId,
            IsActive ?? existingPaymentMethod.IsActive
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async deletePaymentMethod(paymentMethodId, userId) {
        const result = await PaymentMethodModel.delete(
            paymentMethodId,
            userId
        );          

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    }

};

module.exports = PaymentMethodService;