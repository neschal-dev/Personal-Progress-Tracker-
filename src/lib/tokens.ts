import jwt from "jsonwebtoken";
import { common } from "../configs/index.js";

export function createTokens(payload: object) {
  const accessToken = jwt.sign(payload, common.ACCESS_TOKEN_SECRET, {
    expiresIn: Number(common.ACCESS_TOKEN_MAX_AGE),
  });
  const refreshToken = jwt.sign(payload, common.REFRESH_TOKEN_SECRET, {
    expiresIn: Number(common.REFRESH_TOKEN_MAX_AGE),
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, common.ACCESS_TOKEN_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, common.REFRESH_TOKEN_SECRET);
}
