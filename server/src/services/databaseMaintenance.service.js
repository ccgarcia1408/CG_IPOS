const path = require("path");
const DatabaseMaintenanceModel = require("../models/databaseMaintenance.model");
const ApiError = require("../utils/ApiError");

function buildBackupFilename(date = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    const stamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;
    return `${stamp}_cg_ipos_db.sql`;
}

const DatabaseMaintenanceService = {
    listBackups() {
        return DatabaseMaintenanceModel.listBackupFiles();
    },

    async createBackup() {
        const filename = buildBackupFilename();
        const filePath = path.join(DatabaseMaintenanceModel.BACKUP_DIR, filename);

        try {
            await DatabaseMaintenanceModel.runMysqldump(filePath);
        } catch (error) {
            throw new ApiError(500, `Failed to create backup: ${error.message}`);
        }

        return { Filename: filename };
    },

    async restoreBackup(filename) {
        if (!filename) {
            throw new ApiError(400, "Filename is required.");
        }

        // Never trust a client-supplied path -- only accept a filename that matches an actual
        // entry in the backup directory, preventing path traversal.
        const backups = DatabaseMaintenanceModel.listBackupFiles();
        const match = backups.find((backup) => backup.Filename === filename);
        if (!match) {
            throw new ApiError(404, "Backup file not found.");
        }

        // Safety net: capture the current state before overwriting it, so a bad restore is
        // itself recoverable from a fresh backup file on disk.
        await DatabaseMaintenanceService.createBackup();

        const filePath = path.join(DatabaseMaintenanceModel.BACKUP_DIR, filename);
        try {
            await DatabaseMaintenanceModel.runMysqlRestore(filePath);
        } catch (error) {
            throw new ApiError(500, `Failed to restore backup: ${error.message}`);
        }

        return { Message: "Database restored successfully." };
    }
};

module.exports = DatabaseMaintenanceService;
