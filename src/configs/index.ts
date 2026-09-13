/**
 *Node Modules
 */

import "dotenv/config";
import { GoogleAuthCreds } from "../types/auth.types.js";

export const common = {
  PORT: Number(process.env.PORT ?? 5000),
  NODE_ENV: process.env.NODE_ENV,
  IS_PRODUCTION: process.env.NODE_ENV != "development",
  SESSION_SECRET: process.env.SESSION_SECRET as string,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  ACCESS_TOKEN_MAX_AGE: process.env.ACCESS_TOKEN_MAX_AGE as string,
  REFRESH_TOKEN_MAX_AGE: process.env.REFRESH_TOKEN_MAX_AGE as string,
  CLIENT_URL: (process.env.CLIENT_URL as string) ?? "http://localhost:3000", //next js
};

export const googleOauthConfig: GoogleAuthCreds = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL as string,
  SCOPES: [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ],
} as const;
