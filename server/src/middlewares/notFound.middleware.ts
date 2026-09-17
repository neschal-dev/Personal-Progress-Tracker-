import type { Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    code: "NotFound",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};
