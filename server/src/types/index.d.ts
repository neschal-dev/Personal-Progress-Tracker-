import "express-session";
import "express";

declare module "express-session" {
  interface Session {
    state?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      // Set by requireAuth middleware after verifying the accessToken cookie
      userId?: string;
    }
  }
}
