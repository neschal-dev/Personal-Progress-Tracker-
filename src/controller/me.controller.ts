/**
 * Types
 */
import type { Request, Response } from "express";

/**
 * Repository
 */
import { findUserByGoogleId } from "../db/repository/user.repository.js";
import { verifyAccessToken } from "../lib/tokens.js";

export async function getMe(req: Request, res: Response) {
  // Retrieve authorization header from request
  const { authorization } = req.headers;

  // Handle case when client doesn't send request with access token
  if (!authorization) {
    return res.status(401).json({
      code: "AccessTokenError",
      message: "Access Token is required",
    });
  }

  // Retrieve only access token from authorization header
  const [scheme, accessToken] = authorization.split(" ");

  // Handle malformed authorization header (expected format: "Bearer <token>")
  if (scheme !== "Bearer" || !accessToken) {
    return res.status(401).json({
      code: "AccessTokenError",
      message: "Malformed authorization header",
    });
  }

  let userId: string;

  try {
    const decoded = verifyAccessToken(accessToken) as { userId: string };
    userId = decoded.userId; // assign to the OUTER userId, don't redeclare it
  } catch (err) {
    return res.status(401).json({
      code: "AccessTokenError",
      message: "Access token is invalid or expired",
    });
  }

  try {
    const me = await findUserByGoogleId(userId);
    res.json(me);
  } catch (err) {
    console.error("Error getting current user", err);
    res.status(500);
  }
}
