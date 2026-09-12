import DiscountModel from "../models/discount.model";
import ApiError from "../utils/ApiError";

const DiscountService = {
    async getDiscounts() {
        return await DiscountModel.getAll();
    },

    async getActiveDiscounts() {
        return await DiscountModel.getAllActive();
    },

    async getDiscountById(discountId: any) {
        const discount = await DiscountModel.findById(discountId);

        if (!discount) {
            throw new ApiError(404, "Discount not found");
        }

        return discount;
    },

    async createDiscount(data: any, userId: any) {
        const { Name, Description, Type, Value } = data;

        if (!Name) {
            throw new ApiError(400, "Discount name is required.");
        }

        const result = await DiscountModel.create(
            Name,
            Description ?? null,
            Type ?? "PERCENTAGE",
            Value ?? 0,
            userId
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async updateDiscount(discountId: any, data: any, userId: any) {
        const {
            Name,
            Description,
            Type,
            Value,
            IsActive
        } = data;

        const existingDiscount = await DiscountModel.findById(discountId);

        if (!existingDiscount) {
            throw new ApiError(404, "Discount not found");
        }

        const result = await DiscountModel.update(
            discountId,
            Name ?? existingDiscount.Name,
            Description ?? existingDiscount.Description,
            Type ?? existingDiscount.Type,
            Value ?? existingDiscount.Value,
            userId,
            IsActive ?? existingDiscount.IsActive
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async deleteDiscount(discountId: any, userId: any) {
        const result = await DiscountModel.delete(
            discountId,
            userId
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    }

};

export default DiscountService;
