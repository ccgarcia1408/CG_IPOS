const CashierShiftModel = require("../models/cashierShift.model");
const ApiError = require("../utils/ApiError");

const CashierShiftService = {
    async openShift(cashierId, data) {
        const { BranchId, TerminalId, OpeningCash } = data;

        if (!BranchId || !TerminalId) {
            throw new ApiError(400, "Branch and terminal are required.");
        }

        const result = await CashierShiftModel.open(cashierId, BranchId, TerminalId, OpeningCash, cashierId);

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async closeShift(cashierId, cashierShiftId, data) {
        const { ClosingCash } = data;

        const result = await CashierShiftModel.close(cashierShiftId, cashierId, ClosingCash, cashierId);

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async getMyOpenShift(cashierId) {
        return await CashierShiftModel.getMyOpenShift(cashierId);
    }
};

module.exports = CashierShiftService;
