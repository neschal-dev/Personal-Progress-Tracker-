/**
 * Types
 */
import type { Request, Response } from "express";

/**
 * Repository
 */
import { findUserById } from "../db/repository/user.repository.js";

export async function getMe(req: Request, res: Response) {
  // requireAuth middleware has already verified the token and set req.userId
  try {
    const me = await findUserById(req.userId!);

    if (!me) {
      return res.status(404).json({
        code: "UserNotFound",
        message: "User no longer exists",
      });
    }

    return res.json(me);
  } catch (err) {
    console.error("Error getting current user", err);
    return res.status(500).json({
      code: "ServerError",
      message: "Failed to retrieve user",
    });
  }
}
