const TerminalModel = require("../models/terminal.model");

const TerminalService = {
    async getTerminals() {
        return await TerminalModel.getAll();
    }
}

module.exports = TerminalService;