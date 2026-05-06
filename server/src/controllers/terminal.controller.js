const TerminalService = require("../services/terminal.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getTerminals = asyncHandler(async (req, res) => {
    const terminals = await TerminalService.getTerminals();

    res.status(200).json(
        new ApiResponse(200, "Terminals fetched successfully", terminals)
    );
});

module.exports = {
    getTerminals,
};