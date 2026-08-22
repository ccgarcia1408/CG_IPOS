const CashierShiftService = require("../services/cashierShift.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const openShift = asyncHandler(async (req, res) => {
    const result = await CashierShiftService.openShift(req.user.UserId, req.body);

    res.status(201).json(new ApiResponse(201, result.Message, { CashierShiftId: result.CashierShiftId }));
});

const closeShift = asyncHandler(async (req, res) => {
    const result = await CashierShiftService.closeShift(req.user.UserId, Number(req.params.id), req.body);

    res.status(200).json(
        new ApiResponse(200, result.Message, { ExpectedCash: result.ExpectedCash, Variance: result.Variance })
    );
});

const getMyOpenShift = asyncHandler(async (req, res) => {
    const shift = await CashierShiftService.getMyOpenShift(req.user.UserId);

    res.status(200).json(new ApiResponse(200, "Current shift fetched successfully", shift));
});

module.exports = {
    openShift,
    closeShift,
    getMyOpenShift
};
