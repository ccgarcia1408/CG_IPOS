const BranchService = require("../services/branch.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getBranches = asyncHandler(async (req, res) => {
    const branches = await BranchService.getBranches();

    res.status(200).json(
        new ApiResponse(200, "Branches fetched successfully", branches)
    );
});

const getActiveBranches = asyncHandler(async (req, res) => {
    const branches = await BranchService.getActiveBranches();

    res.status(200).json(
        new ApiResponse(200, "Active branches fetched successfully", branches)
    );
});

const getBranchById = asyncHandler(async (req, res) => {
    const { branchId } = req.params;
    const branch = await BranchService.getBranchById(branchId);

    res.status(200).json(
        new ApiResponse(200, "Branch fetched successfully", branch)
    );
});

module.exports = {
    getBranches,
    getActiveBranches,
    getBranchById,
};