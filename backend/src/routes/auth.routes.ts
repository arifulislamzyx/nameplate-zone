import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Friendly response for people opening the login URL in a browser (GET)
router.get("/login", (_req, res) =>
  res.status(405).json({
    message:
      "This endpoint accepts POST only. To log in, use the admin login page of the website (/admin/login).",
    example: {
      method: "POST",
      body: { email: "admin@example.com", password: "••••••" },
    },
  })
);

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
    res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.adminId },
      select: { id: true, name: true, email: true },
    });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (err) {
    next(err);
  }
});

export default router;
