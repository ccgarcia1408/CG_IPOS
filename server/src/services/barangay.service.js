const BarangayModel = require("../models/barangay.model");
const ApiError = require("../utils/ApiError");

const BarangayService = {
    async getBarangays() {
        return await BarangayModel.getAll();
    },

    async getActiveBarangays() {
        return await BarangayModel.getAllActive();
    },

    async getBarangayById(barangayId) {
        const barangay = await BarangayModel.findById(barangayId);

        if (!barangay) {
            throw new ApiError(404, "Barangay not found");
        }

        return barangay;
    },

    async getBarangaysByMunicipalityId(municipalityId) {
        const barangays = await BarangayModel.findByMunicipalityId(municipalityId);

        if (!barangays || barangays.length === 0) {
            throw new ApiError(404, "No barangays found for the given municipality ID");
        }

        return barangays;
    },

    async createBarangay(data, userId) {
        const { MunicipalityId, Name } = data;

        if (!MunicipalityId) {
            throw new ApiError(400, "Municipality ID is required.");
        }

        if (!Name) {
            throw new ApiError(400, "Barangay name is required.");
        }

        const result = await BarangayModel.create(
            MunicipalityId,
            Name,            
            userId
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async updateBarangay(barangayId, data, userId) {
        const {
            MunicipalityId,
            Name,
            IsActive
        } = data;

        const existingBarangay = await BarangayModel.findById(barangayId);

        if (!existingBarangay) {
            throw new ApiError(404, "Barangay not found");
        }

        const result = await BarangayModel.update(
            barangayId,
            MunicipalityId ?? existingBarangay.MunicipalityId,
            Name ?? existingBarangay.Name,
            userId,
            IsActive ?? existingBarangay.IsActive
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async deleteBarangay(barangayId, userId) {
        const result = await BarangayModel.delete(
            barangayId,
            userId
        );          

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    }

};

module.exports = BarangayService;