import BranchService from "../services/branch.service";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

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

const createBranch = asyncHandler(async (req, res) => {
    const result = await BranchService.createBranch(
        req.body,
        req.user.UserId
    );

    res.status(201).json(
        new ApiResponse(
            201,
            result.Message,
            {
                BranchId: result.BranchId
            }
        )
    );
});

const updateBranch = asyncHandler(async (req, res) => {
    const { branchId } = req.params;

    const result = await BranchService.updateBranch(
        branchId,
        req.body,
        req.user.UserId
    );

    res.status(200).json(
        new ApiResponse(
            200,
            result.Message,
            null
        )
    );
});

const deleteBranch = asyncHandler(async (req, res) => {
    const { branchId } = req.params;

    const result = await BranchService.deleteBranch(
        branchId,
        req.user.UserId
    );

    res.status(200).json(
        new ApiResponse(
            200,
            result.Message,
            null
        )
    );
});

export {
    getBranches,
    getActiveBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch
};