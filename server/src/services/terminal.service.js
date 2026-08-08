const TerminalModel = require("../models/terminal.model");
const ApiError = require("../utils/ApiError");

const TerminalService = {
    // GET TERMINALS
    async getTerminals() {
        return await TerminalModel.getAll();
    },
    // GET ACTIVE TERMINALS
    async getActiveTerminals() {
        return await TerminalModel.getAllActive();
    },

    // GET TERMINAL BY ID
    async getTerminalById(terminalId) {
        const terminal = await TerminalModel.findById(terminalId);

        if (!terminal) {
            throw new ApiError(404, "Terminal not found");
        }

        return terminal;
    },

    // CREATE TERMINAL
    async createTerminal(data, userId) {
        const { BranchId, Name, Description } = data;

        if (!BranchId || !Name?.trim()) {
            throw new ApiError(400, "Branch and terminal name are required.");
        }

        const result = await TerminalModel.create(
            BranchId,
            Name.trim(),
            Description?.trim() || null,
            userId
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    // UPDATE TERMINAL
    async updateTerminal(terminalId, data, userId) {
        const terminal = await this.getTerminalById(terminalId);

        const result = await TerminalModel.update(
            terminalId,
            data.BranchId ?? terminal.BranchId,
            data.Name?.trim() || terminal.Name,
            data.Description?.trim() || null,
            userId,
            data.IsActive ?? terminal.IsActive
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    // DELETE TERMINAL
    async deleteTerminal(terminalId, userId) {
        await this.getTerminalById(terminalId);

        const result = await TerminalModel.delete(terminalId, userId);

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },
};

module.exports = TerminalService;
