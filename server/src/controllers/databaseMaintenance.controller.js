const DatabaseMaintenanceService = require("../services/databaseMaintenance.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getBackups = asyncHandler(async (req, res) => {
    const backups = DatabaseMaintenanceService.listBackups();

    res.status(200).json(
        new ApiResponse(200, "Backups fetched successfully", backups)
    );
});

const createBackup = asyncHandler(async (req, res) => {
    const result = await DatabaseMaintenanceService.createBackup();

    res.status(201).json(
        new ApiResponse(201, "Backup created successfully", result)
    );
});

const restoreBackup = asyncHandler(async (req, res) => {
    const result = await DatabaseMaintenanceService.restoreBackup(req.body.Filename);

    res.status(200).json(
        new ApiResponse(200, result.Message, null)
    );
});

module.exports = {
    getBackups,
    createBackup,
    restoreBackup
};
