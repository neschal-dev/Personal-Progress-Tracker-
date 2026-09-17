import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(`Unhandled Request Error`, err);
  if (res.headersSent) return next(err);

  res.status(500).json({
    code: "ServerError",
    message: "An unexpected error occured",
  });
};
