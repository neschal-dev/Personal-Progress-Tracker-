/**
 * Node Modules
 */
import { google } from "googleapis";
import crypto from "node:crypto";

/**
 * Types
 */
import type { Request, Response } from "express";

/**
 * Custom Modules
 */
import { oauth2Client } from "../lib/oauth2Client.js";
import { googleOauthConfig } from "../configs/index.js";

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

  // TODO: find-or-create the user in your DB using userInfo.emailAddresses[0].value,
  // then issue your own session/JWT and redirect to the frontend instead of
  // returning raw profile data.
  return res.status(200).json({
    message: "Authenticated",
    user: {
      firstName: userInfo.names[0].givenName,
      lastName: userInfo.names[0].familyName,
      email: userInfo.emailAddresses[0].value,
      photo: userInfo.photos[0].url,
    },
  });
}
