import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

import { execSqlFile } from "./sqlRunner";

// Deploys every server/src/procedures/**/*.sql file to the configured database.
// Each file is expected to DROP PROCEDURE IF EXISTS before CREATE, so this is safe to re-run.
// Usage: node src/database/deployProcedures.js [substring-filter]

const PROCEDURES_DIR = path.join(__dirname, "..", "procedures");

function findSqlFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findSqlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".sql")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function run() {
  const filter = process.argv[2];
  const allFiles = findSqlFiles(PROCEDURES_DIR).sort();
  const files = filter
    ? allFiles.filter((file) => file.split(path.sep).join("/").includes(filter))
    : allFiles;

  if (!files.length) {
    console.log("No matching procedure files found.");
    return;
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    for (const file of files) {
      const relative = path.relative(PROCEDURES_DIR, file);
      try {
        await execSqlFile(connection, file);
        console.log(`OK   ${relative}`);
      } catch (error) {
        console.error(`FAIL ${relative}: ${(error as Error).message}`);
        process.exitCode = 1;
      }
    }
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error("Deploy failed:", (error as Error).message);
  process.exitCode = 1;
});
