/**
 * Node Modules
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

/**
 * Config
 */
import { db } from "../configs/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "migrations");

const pool = new Pool({ connectionString: db.DATABASE_URL });
console.log("Connecting with:", db.DATABASE_URL);
async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id          TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const { rows } = await pool.query<{ id: string }>(
    "SELECT id FROM schema_migrations",
  );
  return new Set(rows.map((row) => row.id));
}

async function runMigrations(): Promise<void> {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((file) => file.endsWith(".sql"))
    .sort(); // relies on the 001_, 002_, 003_ numeric prefix for order

  const pending = files.filter((file) => !applied.has(file));

  if (pending.length === 0) {
    console.log("No pending migrations.");
    return;
  }

  for (const file of pending) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = await readFile(filePath, "utf-8");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [
        file,
      ]);
      await client.query("COMMIT");
      console.log(`Applied: ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`Failed: ${file}`);
      throw err;
    } finally {
      client.release();
    }
  }
}

runMigrations()
  .then(() => {
    console.log("Migrations complete.");
    return pool.end();
  })
  .catch((err) => {
    console.error("Migration run failed:", err);
    return pool.end().finally(() => process.exit(1));
  });
