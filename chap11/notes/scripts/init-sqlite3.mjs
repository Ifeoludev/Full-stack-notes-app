import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile =
  process.env.SQLITE_FILE || path.join(__dirname, "../chap07.sqlite3");
const schemaFile = path.join(__dirname, "../models/schema-sqlite3.sql");

async function initializeDatabase() {
  console.log(`Initializing SQLite3 database at ${dbFile}`);

  const db = new sqlite3.Database(dbFile, async (err) => {
    if (err) {
      console.error("Error opening database:", err);
      process.exit(1);
    }
  });

  try {
    const schema = fs.readFileSync(schemaFile, "utf8");
    console.log(`Applying schema from ${schemaFile}`);

    db.exec(schema, (err) => {
      if (err) {
        console.error("Error executing schema:", err);
        process.exit(1);
      } else {
        console.log("Database initialized successfully.");
        db.close();
      }
    });
  } catch (err) {
    console.error("Error reading schema file:", err);
    process.exit(1);
  }
}

initializeDatabase();
