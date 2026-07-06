import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  adminId?: string;
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET as string) as {
      adminId: string;
    };
    req.adminId = payload.adminId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
