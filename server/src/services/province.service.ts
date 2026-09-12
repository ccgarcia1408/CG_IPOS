import ProvinceModel from "../models/province.model";
import ApiError from "../utils/ApiError";

const ProvinceService = {
    async getProvinces() {
        return await ProvinceModel.getAll();
    },

    async getActiveProvinces() {
        return await ProvinceModel.getAllActive();
    },

    async getProvinceById(provinceId: any) {
        const province = await ProvinceModel.findById(provinceId);

        if (!province) {
            throw new ApiError(404, "Province not found");
        }
        
        return province;
    },

    async createProvince(data: any, userId: any) {
        const { RegionId, Name } = data;

        if (!RegionId) {
            throw new ApiError(400, "Region ID is required.");
        }

        if (!Name) {
            throw new ApiError(400, "Province name is required.");
        }

        const result = await ProvinceModel.create(
            RegionId,
            Name,            
            userId
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async updateProvince(provinceId: any, data: any, userId: any) {
        const {
            RegionId,
            Name,
            IsActive
        } = data;

        const existingProvince = await ProvinceModel.findById(provinceId);

        if (!existingProvince) {
            throw new ApiError(404, "Province not found");
        }

        const result = await ProvinceModel.update(
            provinceId,
            RegionId ?? existingProvince.RegionId,
            Name ?? existingProvince.Name,
            userId,
            IsActive ?? existingProvince.IsActive
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async deleteProvince(provinceId: any, userId: any) {
        const result = await ProvinceModel.delete(
            provinceId,
            userId
        );          

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    }

};

export default ProvinceService;