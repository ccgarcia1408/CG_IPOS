const TaxModel = require("../models/tax.model");
const ApiError = require("../utils/ApiError");

const TaxService = {
    async getTaxes() {
        return await TaxModel.getAll();
    },

    async getActiveTaxes() {
        return await TaxModel.getAllActive();
    },

    async getTaxById(taxId) {
        const tax = await TaxModel.findById(taxId);

        if (!tax) {
            throw new ApiError(404, "Tax not found");
        }

        return tax;
    },

    async createTax(data, userId) {
        const { Name, Description, Rate } = data;

        if (!Name) {
            throw new ApiError(400, "Tax name is required.");
        }

        const result = await TaxModel.create(
            Name,
            Description ?? null,
            Rate ?? 0,
            userId
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async updateTax(taxId, data, userId) {
        const {
            Name,
            Description,
            Rate,
            IsActive
        } = data;

        const existingTax = await TaxModel.findById(taxId);

        if (!existingTax) {
            throw new ApiError(404, "Tax not found");
        }

        const result = await TaxModel.update(
            taxId,
            Name ?? existingTax.Name,
            Description ?? existingTax.Description,
            Rate ?? existingTax.Rate,
            userId,
            IsActive ?? existingTax.IsActive
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async deleteTax(taxId, userId) {
        const result = await TaxModel.delete(
            taxId,
            userId
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    }

};

module.exports = TaxService;
