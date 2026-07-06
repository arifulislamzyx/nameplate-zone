import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/auth";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().nullable().or(z.literal("")),
  subject: z.string().optional().nullable(),
  message: z.string().min(5),
});

router.post("/", async (req, res, next) => {
  try {
    const data = contactSchema.parse(req.body);
    const message = await prisma.contactMessage.create({
      data: { ...data, email: data.email || null },
    });
    res.status(201).json({ message: "Message received", id: message.id });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAdmin, async (_req, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/read", requireAdmin, async (req, res, next) => {
  try {
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(message);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    res.json({ message: "Message deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
