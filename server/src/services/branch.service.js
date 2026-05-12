const BranchModel = require("../models/branch.model");

const BranchService = {
    async getBranches() {
        return await BranchModel.getAll();
    },

    async getActiveBranches() {
        return await BranchModel.getAllActive();
    }
};

module.exports = BranchService;