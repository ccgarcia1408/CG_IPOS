const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

const { execSqlFile } = require("./sqlRunner");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

// Migrations that were already applied to the dev database by hand before this
// runner existed. Recorded here once so `migrate.js` never tries to replay them.
const PRE_EXISTING_MIGRATIONS = [
  "20260821_dynamic_menu_inventory.sql",
  "20260821_product_inventory_separation.sql",
];

async function ensureMigrationsTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
        MigrationId INT NOT NULL AUTO_INCREMENT,
        Filename VARCHAR(255) NOT NULL,
        AppliedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (MigrationId),
        UNIQUE KEY uq_schema_migrations_filename (Filename)
    ) ENGINE=InnoDB
  `);

  for (const filename of PRE_EXISTING_MIGRATIONS) {
    await connection.query(
      "INSERT IGNORE INTO schema_migrations (Filename) VALUES (?)",
      [filename]
    );
  }
}

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await ensureMigrationsTable(connection);

    const [appliedRows] = await connection.query("SELECT Filename FROM schema_migrations");
    const applied = new Set(appliedRows.map((row) => row.Filename));

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    const pending = files.filter((file) => !applied.has(file));

    if (!pending.length) {
      console.log("No pending migrations.");
      return;
    }

    for (const file of pending) {
      console.log(`Applying ${file} ...`);
      const statementCount = await execSqlFile(connection, path.join(MIGRATIONS_DIR, file));
      await connection.query("INSERT INTO schema_migrations (Filename) VALUES (?)", [file]);
      console.log(`  -> ${statementCount} statement(s) executed, recorded.`);
    }

    console.log(`Done. Applied ${pending.length} migration(s).`);
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
});
