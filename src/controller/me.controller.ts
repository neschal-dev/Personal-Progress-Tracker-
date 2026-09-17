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

  let googleId: string;

  // Verify the access token and pull the Google ID out of its payload
  // (the token is signed with { sub: user.id, googleId: user.google_id })
  try {
    const decoded = verifyAccessToken(accessToken) as {
      sub: string;
      googleId: string;
    };
    googleId = decoded.googleId; // assign to the OUTER googleId, don't redeclare it
  } catch (err) {
    return res.status(401).json({
      code: "AccessTokenError",
      message: "Access token is invalid or expired",
    });
  }

  // Look up the user in the DB using the verified Google ID
  try {
    const me = await findUserByGoogleId(googleId);
    return res.json(me);
  } catch (err) {
    console.error("Error getting current user", err);
    return res.status(500).json({
      code: "ServerError",
      message: "Failed to retrieve user",
    });
  }
}
