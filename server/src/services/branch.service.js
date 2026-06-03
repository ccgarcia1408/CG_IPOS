const BranchModel = require("../models/branch.model");

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
};

module.exports = BranchService;