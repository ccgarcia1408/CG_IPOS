const OfficialReceiptAssignmentModel = require("../models/officialReceiptAssignment.model");
const ApiError = require("../utils/ApiError");

const positiveInteger = (value, label) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
        throw new ApiError(400, `${label} must be a positive whole number.`);
    }
    return number;
};

const orNumber = (value, label) => {
    const text = String(value ?? "").trim();
    if (!/^\d+$/.test(text)) {
        throw new ApiError(400, `${label} must be numeric.`);
    }
    return text;
};

const OfficialReceiptAssignmentService = {
    async getAssignments() {
        return OfficialReceiptAssignmentModel.getAll();
    },

    async getAssignmentById(orAssignmentId) {
        const assignment = await OfficialReceiptAssignmentModel.findById(positiveInteger(orAssignmentId, "ORAssignmentId"));
        if (!assignment) throw new ApiError(404, "OR assignment not found");
        return assignment;
    },

    async getActiveAssignmentForUser(userId) {
        return OfficialReceiptAssignmentModel.findActiveByUserId(positiveInteger(userId, "UserId"));
    },

    async createAssignment(data, createdBy) {
        const orFrom = orNumber(data.ORFrom, "ORFrom");
        const orTo = orNumber(data.ORTo, "ORTo");
        const userId = positiveInteger(data.UserId, "UserId");

        const result = await OfficialReceiptAssignmentModel.create(orFrom, orTo, userId, createdBy);
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async updateAssignment(orAssignmentId, data, updatedBy) {
        const orTo = orNumber(data.ORTo, "ORTo");
        const userId = positiveInteger(data.UserId, "UserId");

        const result = await OfficialReceiptAssignmentModel.update(
            positiveInteger(orAssignmentId, "ORAssignmentId"), orTo, userId, updatedBy
        );
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async deleteAssignment(orAssignmentId, deletedBy) {
        const result = await OfficialReceiptAssignmentModel.delete(
            positiveInteger(orAssignmentId, "ORAssignmentId"), deletedBy
        );
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },
};

module.exports = OfficialReceiptAssignmentService;
