import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
  }
  console.error(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ message });
};
