const fs = require("fs");

// Files that CREATE PROCEDURE use `DELIMITER $$ ... $$ DELIMITER ;` because the body
// contains semicolons. The mysql2 driver has no notion of DELIMITER (that's a mysql-CLI-only
// directive), so those files must be split into individual statements by hand before
// being sent over the connection.
function splitDelimiterFile(sql) {
  const lines = sql.split(/\r?\n/);
  const statements = [];
  let delimiter = ";";
  let buffer = "";

  for (const line of lines) {
    const delimiterMatch = line.match(/^\s*DELIMITER\s+(\S+)\s*$/i);
    if (delimiterMatch) {
      const pending = buffer.trim();
      if (pending) statements.push(pending);
      buffer = "";
      delimiter = delimiterMatch[1];
      continue;
    }

    buffer += (buffer ? "\n" : "") + line;

    if (delimiter !== ";" && buffer.trimEnd().endsWith(delimiter)) {
      const statement = buffer.trimEnd().slice(0, -delimiter.length).trim();
      if (statement) statements.push(statement);
      buffer = "";
    }
  }

  const pending = buffer.trim();
  if (pending) {
    statements.push(pending.endsWith(";") ? pending.slice(0, -1).trim() : pending);
  }

  return statements.filter(Boolean);
}

function stripFullCommentLines(sql) {
  return sql
    .split(/\r?\n/)
    .filter((line) => !/^\s*(--|#)/.test(line))
    .join("\n");
}

function splitPlainFile(sql) {
  return stripFullCommentLines(sql)
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function execSqlFile(connection, filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  const usesDelimiter = /^\s*DELIMITER\s+\S+/im.test(sql);
  const statements = usesDelimiter ? splitDelimiterFile(sql) : splitPlainFile(sql);

  for (const statement of statements) {
    if (!statement) continue;
    await connection.query(statement);
  }

  return statements.length;
}

module.exports = { execSqlFile };
