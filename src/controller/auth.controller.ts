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
import { googleOauthConfig } from "../configs/index.js";
import { findOrCreateUser } from "../db/repository/user.repository.js";
import { createTokens } from "../lib/tokens.js";

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

  // // State has been verified — clear it so it can't be reused
  // delete req.session.state;

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
  // TODO: issue your own session/JWT using `user`, then redirect to frontend
  // instead of returning raw profile data.
  const { accessToken, refreshToken } = await createTokens({
    sub: user.id,
    googleId: user.google_id,
  });
  return res.status(200).json({
    message: "Authenticated",
    user,
  });
}
