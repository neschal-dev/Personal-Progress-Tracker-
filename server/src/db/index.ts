/**
 * Node Modules
 */
import { Pool } from "pg";
import type { QueryResult, QueryResultRow } from "pg";

/**
 * Config
 */
import { db } from "../configs/index.js";

export const pool = new Pool({
  connectionString: db.DATABASE_URL,
});

pool.on("error", (err) => {
  // Fires for errors on IDLE clients in the pool (e.g. connection dropped
  // by the DB) — not caught by your route handlers, so it must be logged
  // here or it becomes an unhandled error that crashes the process.
  console.error("Unexpected error on idle Postgres client", err);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function connectDB(): Promise<void> {
  // Verifies the pool can actually reach Postgres at startup, rather than
  // waiting for the first real query (in some request handler, much later)
  // to discover the DB is unreachable.
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");

    console.log("Connected to Postgres ✅");
  } finally {
    client.release();
  }
}

export async function disconnectDB(): Promise<void> {
  await pool.end();
  console.log("Postgres pool closed");
}
