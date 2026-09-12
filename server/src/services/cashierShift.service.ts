import CashierShiftModel from "../models/cashierShift.model";
import ApiError from "../utils/ApiError";

const CashierShiftService = {
    async openShift(cashierId: any, data: any) {
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

    async closeShift(cashierId: any, cashierShiftId: any, data: any) {
        const { ClosingCash } = data;

        const result = await CashierShiftModel.close(cashierShiftId, cashierId, ClosingCash, cashierId);

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async getMyOpenShift(cashierId: any) {
        return await CashierShiftModel.getMyOpenShift(cashierId);
    }
};

export default CashierShiftService;
