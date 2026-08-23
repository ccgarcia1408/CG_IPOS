const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
require("dotenv").config();

// There is no stored procedure that can dump/restore the whole database -- mysqldump/mysql are
// OS-level tools. This model is the one place in the app that shells out to them instead of
// calling a stored procedure, matching this codebase's Model = Repository layer convention
// (raw I/O only, no business rules -- those live in databaseMaintenance.service.js).
const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_BACKUP_DIR,
    MYSQL_BIN_DIR
} = process.env;

fs.mkdirSync(DB_BACKUP_DIR, { recursive: true });

const EXE_SUFFIX = process.platform === "win32" ? ".exe" : "";
const MYSQLDUMP_PATH = path.join(MYSQL_BIN_DIR, `mysqldump${EXE_SUFFIX}`);
const MYSQL_PATH = path.join(MYSQL_BIN_DIR, `mysql${EXE_SUFFIX}`);

const connectionArgs = ["-h", DB_HOST, "-P", String(DB_PORT), "-u", DB_USER];
const childEnv = { ...process.env, MYSQL_PWD: DB_PASSWORD };

function runChildProcess(command, args, { stdinPath, stdoutPath }) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { env: childEnv });

        let stderr = "";
        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        if (stdinPath) {
            fs.createReadStream(stdinPath).pipe(child.stdin);
        }

        const outStream = stdoutPath ? fs.createWriteStream(stdoutPath) : null;
        if (outStream) {
            child.stdout.pipe(outStream);
        }

        child.on("error", (error) => reject(error));

        child.on("close", (code) => {
            if (code === 0) return resolve();

            if (stdoutPath) fs.rm(stdoutPath, { force: true }, () => {});
            reject(new Error(stderr.trim() || `Process exited with code ${code}`));
        });
    });
}

const DatabaseMaintenanceModel = {
    BACKUP_DIR: DB_BACKUP_DIR,

    listBackupFiles() {
        return fs
            .readdirSync(DB_BACKUP_DIR)
            .filter((name) => name.endsWith("_cg_ipos_db.sql"))
            .map((name) => {
                const stats = fs.statSync(path.join(DB_BACKUP_DIR, name));
                return { Filename: name, SizeBytes: stats.size, CreatedAt: stats.mtime };
            })
            .sort((a, b) => b.CreatedAt - a.CreatedAt);
    },

    async runMysqldump(outFilePath) {
        await runChildProcess(
            MYSQLDUMP_PATH,
            [...connectionArgs, "--routines", "--triggers", "--single-transaction", "--default-character-set=utf8mb4", DB_NAME],
            { stdoutPath: outFilePath }
        );
    },

    async runMysqlRestore(inFilePath) {
        await runChildProcess(MYSQL_PATH, [...connectionArgs, DB_NAME], { stdinPath: inFilePath });
    }
};

module.exports = DatabaseMaintenanceModel;
