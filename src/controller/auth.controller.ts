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

  const authorizationURL = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: googleOauthConfig.SCOPES,
    include_granted_scopes: true,
    state,
  });

  res.redirect(authorizationURL);
}
