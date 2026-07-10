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
        const { Name, Description } = data;

        if (!Name) {
            throw new ApiError(400, "Branch name is required.");
        }

        const result = await BranchModel.create(
            Name,
            Description ?? null,
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
            IsActive
        } = data;

        if (!Name || !Name.trim()) {
            throw new ApiError(400, "Branch name is required.");
        }

        const result = await BranchModel.update(
            branchId,
            Name,
            Description ?? null,
            userId,
            IsActive
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },
};

module.exports = BranchService;