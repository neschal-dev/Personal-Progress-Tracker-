/**
 * Types
 */
import type { Request, Response, NextFunction } from "express";

/**
 * Custom Modules
 */
import { verifyAccessToken } from "../lib/tokens.js";

/**
 * Verifies the accessToken cookie and attaches the user's internal id to
 * req.userId. Every protected route uses this instead of duplicating the
 * verify logic — see types/index.d.ts for the Request augmentation.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.cookies?.accessToken;

  // Handle case when client doesn't send request with an access token cookie
  if (!accessToken) {
    return res.status(401).json({
      code: "AccessTokenError",
      message: "Access token is required",
    });
  }

  // Verify the access token and pull the user's internal id out of its
  // payload (the token is signed with { sub: user.id, googleId: user.google_id })
  try {
    const decoded = verifyAccessToken(accessToken) as {
      sub: string;
      googleId: string;
    };
    req.userId = decoded.sub;
    next();
  } catch (err) {
    return res.status(401).json({
      code: "AccessTokenError",
      message: "Access token is invalid or expired",
    });
  }
}
