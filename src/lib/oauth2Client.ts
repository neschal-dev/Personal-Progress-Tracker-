/**
 * Node Modules
 */
import { google } from "googleapis";

/**
 * Config
 */
import { googleOauthConfig } from "../configs/index.js";

export const oauth2Client = new google.auth.OAuth2(
  googleOauthConfig.CLIENT_ID,
  googleOauthConfig.CLIENT_SECRET,
  googleOauthConfig.REDIRECT_URL
);