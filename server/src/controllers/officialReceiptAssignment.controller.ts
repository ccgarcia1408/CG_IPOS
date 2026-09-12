import OfficialReceiptAssignmentService from "../services/officialReceiptAssignment.service";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

const getAssignments = asyncHandler(async (req, res) => {
    const assignments = await OfficialReceiptAssignmentService.getAssignments();
    res.status(200).json(new ApiResponse(200, "OR assignments fetched successfully", assignments));
});

const getAssignmentById = asyncHandler(async (req, res) => {
    const assignment = await OfficialReceiptAssignmentService.getAssignmentById(req.params.orAssignmentId);
    res.status(200).json(new ApiResponse(200, "OR assignment fetched successfully", assignment));
});

const getMyActiveAssignment = asyncHandler(async (req, res) => {
    const assignment = await OfficialReceiptAssignmentService.getActiveAssignmentForUser(req.user.UserId);
    res.status(200).json(new ApiResponse(200, "Active OR assignment fetched successfully", assignment));
});

const createAssignment = asyncHandler(async (req, res) => {
    const result = await OfficialReceiptAssignmentService.createAssignment(req.body, req.user.UserId);
    res.status(201).json(new ApiResponse(201, result.Message, { ORAssignmentId: result.ORAssignmentId }));
});

const updateAssignment = asyncHandler(async (req, res) => {
    const result = await OfficialReceiptAssignmentService.updateAssignment(req.params.orAssignmentId, req.body, req.user.UserId);
    res.status(200).json(new ApiResponse(200, result.Message, null));
});

const deleteAssignment = asyncHandler(async (req, res) => {
    const result = await OfficialReceiptAssignmentService.deleteAssignment(req.params.orAssignmentId, req.user.UserId);
    res.status(200).json(new ApiResponse(200, result.Message, null));
});

export {
    getAssignments,
    getAssignmentById,
    getMyActiveAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
};
