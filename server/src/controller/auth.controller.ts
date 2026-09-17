/**
 * Node Modules
 */
import { google } from "googleapis";
import crypto from "node:crypto";

/**
 * Types
 */
import type { Request, Response } from "express";
import { User } from "../types/user.types.js";

/**
 * Custom Modules
 */
import { oauth2Client } from "../lib/oauth2Client.js";
import { common, googleOauthConfig } from "../configs/index.js";
import { findOrCreateUser } from "../db/repository/user.repository.js";
import { createTokens, verifyRefreshToken } from "../lib/tokens.js";

/**
 * Shared cookie options for access/refresh tokens, so the flags we set at
 * login and the flags we clear at logout can never drift out of sync.
 */
const accessTokenCookieOptions = {
  httpOnly: true,
  secure: common.IS_PRODUCTION,
  sameSite: "lax" as const,
};

const refreshTokenCookieOptions = accessTokenCookieOptions;

export async function googleAuth(req: Request, res: Response) {
  const state = crypto.randomBytes(32).toString("hex");
  req.session.state = state;

  const authorizationURL = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: googleOauthConfig.SCOPES,
    include_granted_scopes: true,
    state,
  });

  res.redirect(authorizationURL);
}

export async function googleCallback(req: Request, res: Response) {
  const query = req.query;

  // Handle case when getting error from google consent screen
  if ("error" in query) {
    return res.status(400).json({
      code: "OAuthError",
      message: "Google consent was denied or failed",
    });
  }

  // Handle case when state doesn't match
  if (!query.state || query.state !== req.session.state) {
    return res.status(400).json({
      code: "StateMismatch",
      message: "State mismatch. Possible CSRF attack.",
    });
  }

  // State has been verified — clear it so it can't be reused
  delete req.session.state;

  // Handle case when code is missing entirely
  if (!query.code || typeof query.code !== "string") {
    return res.status(400).json({
      code: "BadRequest",
      message: "Missing authorization code",
    });
  }

  // Exchange the authorization code and fetch the user's profile.
  // Any failure here (network error, invalid/expired code, revoked consent)
  // must be reported to the client instead of crashing the handler.
  let userInfo;
  try {
    const { tokens } = await oauth2Client.getToken(query.code);
    oauth2Client.setCredentials(tokens);

    const peopleApi = google.people({ version: "v1", auth: oauth2Client });
    const { data } = await peopleApi.people.get({
      resourceName: "people/me",
      personFields: "names,emailAddresses,photos",
    });
    userInfo = data;
  } catch (err) {
    console.error("Google OAuth flow failed.", err);

    return res.status(502).json({
      code: "OAuthExchangeFailed",
      message: "Failed to exchange authorization code with Google",
    });
  }

  // Handle case where necessary info isn't found for creating an account
  if (
    !userInfo.resourceName ||
    !userInfo.names?.[0]?.givenName ||
    !userInfo.names?.[0]?.familyName ||
    !userInfo.photos?.[0]?.url ||
    !userInfo.emailAddresses?.[0]?.value
  ) {
    console.error(
      "Google account is missing required profile information",
      userInfo,
    );

    return res.status(422).json({
      code: "IncompleteProfile",
      message:
        "Google account is missing required profile information (first name, last name, or email)",
    });
  }

  // Find-or-create the user in the DB using their stable Google ID
  let user: User;
  try {
    user = await findOrCreateUser({
      google_id: userInfo.resourceName.replace("people/", ""),
      email: userInfo.emailAddresses[0].value,
      first_name: userInfo.names[0].givenName,
      last_name: userInfo.names[0].familyName,
      avatar_url: userInfo.photos[0].url,
    });
  } catch (err) {
    console.error("Error finding or creating user.", err);

    return res.status(500).json({
      code: "ServerError",
      message: "Failed to create or retrieve user",
    });
  }

  // Guard against issuing tokens without resolved id
  if (!user) {
    console.error("Unable to resolve user id for token creation.");
    return res.sendStatus(500);
  }

  // Issue our own access/refresh tokens for this user, then redirect to
  // the frontend — the client fetches the profile via /me afterwards.
  const { accessToken, refreshToken } = createTokens({
    sub: user.id,
    googleId: user.google_id,
  });

  res.cookie("accessToken", accessToken, {
    ...accessTokenCookieOptions,
    maxAge: Number(common.ACCESS_TOKEN_MAX_AGE) * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...refreshTokenCookieOptions,
    maxAge: Number(common.REFRESH_TOKEN_MAX_AGE) * 1000,
  });

  return res.redirect(`${common.CLIENT_URL}/dashboard`);
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.refreshToken;

  // Handle case when client doesn't send a refresh token cookie
  if (!refreshToken) {
    return res.status(401).json({
      code: "RefreshTokenError",
      message: "Refresh token is required",
    });
  }

  // Verify the refresh token and re-issue both tokens. Rotating the
  // refresh token too (rather than reusing it) limits how long a stolen
  // refresh token stays valid if it's ever leaked.
  try {
    const decoded = verifyRefreshToken(refreshToken) as {
      sub: string;
      googleId: string;
    };

    const tokens = createTokens({
      sub: decoded.sub,
      googleId: decoded.googleId,
    });

    res.cookie("accessToken", tokens.accessToken, {
      ...accessTokenCookieOptions,
      maxAge: Number(common.ACCESS_TOKEN_MAX_AGE) * 1000,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      ...refreshTokenCookieOptions,
      maxAge: Number(common.REFRESH_TOKEN_MAX_AGE) * 1000,
    });

    return res.status(204).send();
  } catch (err) {
    return res.status(401).json({
      code: "RefreshTokenError",
      message: "Refresh token is invalid or expired",
    });
  }
}

export async function logout(req: Request, res: Response) {
  // Clearing options must match the cookie's original path/domain/sameSite
  // or the browser won't recognize it as the same cookie to remove
  res.clearCookie("accessToken", accessTokenCookieOptions);
  res.clearCookie("refreshToken", refreshTokenCookieOptions);

  return res.status(204).send();
}
