const BranchModel = require("../models/branch.model");
const ApiError = require("../utils/ApiError");

const BranchService = {
    async getBranches() {
        return await BranchModel.getAll();
    },

    async getActiveBranches() {
        return await BranchModel.getAllActive();
    },

    async getBranchById(branchId) {
        const branch = await BranchModel.findById(branchId);

        if (!branch) {
            throw new ApiError(404, "Branch not found");
        }
        
        return branch;
    },

    async createBranch(data, userId) {
        const { Name, Description, ContactNo, ProvinceId, MunicipalityId, BarangayId, OtherAddress } = data;

        if (!Name) {
            throw new ApiError(400, "Branch name is required.");
        }

        const result = await BranchModel.create(
            Name,
            Description ?? null,
            ContactNo ?? null,
            ProvinceId ?? null,
            MunicipalityId ?? null,
            BarangayId ?? null,
            OtherAddress ?? null,
            userId
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async updateBranch(branchId, data, userId) {
        const {
            Name,
            Description,
            ContactNo,
            ProvinceId,
            MunicipalityId,
            BarangayId,
            OtherAddress,
            IsActive
        } = data;

        const existingBranch = await BranchModel.findById(branchId);

        if (!existingBranch) {
            throw new ApiError(404, "Branch not found");
        }

        const result = await BranchModel.update(
            branchId,
            Name ?? existingBranch.Name,
            Description ?? existingBranch.Description,
            ContactNo ?? existingBranch.ContactNo,
            ProvinceId ?? existingBranch.ProvinceId,
            MunicipalityId ?? existingBranch.MunicipalityId,
            BarangayId ?? existingBranch.BarangayId,
            OtherAddress ?? existingBranch.OtherAddress,
            userId,
            IsActive ?? existingBranch.IsActive
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async deleteBranch(branchId, userId) {
        const result = await BranchModel.delete(
            branchId,
            userId
        );          

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    }

};

module.exports = BranchService;