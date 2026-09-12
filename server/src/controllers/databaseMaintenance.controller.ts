import DatabaseMaintenanceService from "../services/databaseMaintenance.service";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

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

export {
    getBackups,
    createBackup,
    restoreBackup
};
