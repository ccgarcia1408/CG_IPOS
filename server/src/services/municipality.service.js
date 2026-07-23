const MunicipalityModel = require("../models/municipality.model");
const ApiError = require("../utils/ApiError");

const MunicipalityService = {
    async getMunicipalities() {
        return await MunicipalityModel.getAll();
    },

    async getActiveMunicipalities() {
        return await MunicipalityModel.getAllActive();
    },

    async getMunicipalityById(municipalityId) {
        const municipality = await MunicipalityModel.findById(municipalityId);

        if (!municipality) {
            throw new ApiError(404, "Municipality not found");
        }

        return municipality;
    },

    async getMunicipalitiesByProvinceId(provinceId) {
        const municipalities = await MunicipalityModel.findByProvinceId(provinceId);

        if (!municipalities || municipalities.length === 0) {
            throw new ApiError(404, "No municipalities found for the given province ID");
        }

        return municipalities;
    },

    async createMunicipality(data, userId) {
        const { ProvinceId, Name } = data;

        if (!ProvinceId) {
            throw new ApiError(400, "Province ID is required.");
        }

        if (!Name) {
            throw new ApiError(400, "Municipality name is required.");
        }

        const result = await MunicipalityModel.create(
            ProvinceId,
            Name,            
            userId
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async updateMunicipality(municipalityId, data, userId) {
        const {
            ProvinceId,
            Name,
            IsActive
        } = data;

        const existingMunicipality = await MunicipalityModel.findById(municipalityId);

        if (!existingMunicipality) {
            throw new ApiError(404, "Municipality not found");
        }

        const result = await MunicipalityModel.update(
            municipalityId,
            ProvinceId ?? existingMunicipality.ProvinceId,
            Name ?? existingMunicipality.Name,
            userId,
            IsActive ?? existingMunicipality.IsActive
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async deleteMunicipality(municipalityId, userId) {
        const result = await MunicipalityModel.delete(
            municipalityId,
            userId
        );          

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    }

};

module.exports = MunicipalityService;