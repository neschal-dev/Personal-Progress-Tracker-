/**
 *Node Modules
 */
import { google } from "googleapis";
import crypto from "node:crypto";

/**
 * Types
 */
import type { Request, Response } from "express";

/**
 *Custom Modules
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
  if ("error" in query) return res.sendStatus(400);

  // Handle case when state isn't match
  if (query.state !== req.session.state)
    return res
      .status(400)
      .send({ message: "State mismatch. Possible CSRf attack." });

  // Exchange the authorization code and fetch the user's profile.
  // Any failure here (network, error , invalid /expired code , revoked consent)
  // must be reported to client instead of crashing the handler
  let userInfo;
  try {
    const { tokens } = await oauth2Client.getToken(query.code as string);
    oauth2Client.setCredentials(tokens);

    const peopleApi = google.people({ version: "v1", auth: oauth2Client });
    const { data } = await peopleApi.people.get({
      resourceName: "people/me",
      personFields: "names,emailAddresses,photos",
    });
    userInfo = data;
  } catch (err) {
    console.error("Google OAuth flow failed.", err);

    return res.sendStatus(502);
  }

  // Handle case where necessary info isn't found for creating account
  if (
    !userInfo ||
    !userInfo.names?.[0]?.givenName ||
    !userInfo.names?.[0]?.familyName ||
    !userInfo.photos?.[0]?.url ||
    !userInfo.emailAddresses?.[0]?.value
  ) {
    console.error("Google account is missing required profile information ");

    return res.status(500).json({
      code: "IncompleteProfile",
      message:
        "Google account is missing required profile information (first name, last name, or email)",
    });
  }
}
