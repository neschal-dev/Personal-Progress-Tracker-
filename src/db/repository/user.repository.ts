import { CreateUserInput, User } from "../../types/user.types.js";
import { pool } from "../index.js";

export async function findUserByEmail(
  email: string,
): Promise<User | undefined> {
  const result = await pool.query<User>(
    "SELECT * FROM users WHERE email = $1",
    [email],
  );

  return result.rows[0];
}

export async function findOrCreateUser(input: CreateUserInput): Promise<User> {
  const existing = await pool.query<User>(
    "SELECT * FROM users WHERE google_id = $1",
    [input.google_id],
  );

  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const inserted = await pool.query<User>(
    `INSERT INTO users (google_id, email, first_name, last_name, avatar_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      input.google_id,
      input.email,
      input.first_name,
      input.last_name,
      input.avatar_url,
    ],
  );

  return inserted.rows[0];
}

export async function findUserByGoogleId(
  google_id: string,
): Promise<User | null> {
  const existing = await pool.query<User>(
    "SELECT * FROM users WHERE google_id = $1",
    [google_id],
  );

  return existing.rows[0] ?? null;
}
