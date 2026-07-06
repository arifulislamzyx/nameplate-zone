import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/auth";
import { isCloudinaryConfigured, uploadDataUri } from "../lib/cloudinary";

const router = Router();

const designSchema = z.object({
  title: z.string().default("Custom Nameplate"),
  config: z.any(),
  previewImage: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "SUBMITTED", "REVIEWED", "ORDERED"]).optional(),
});

// Public: save a design (from the customizer)
router.post("/", async (req, res, next) => {
  try {
    const data = designSchema.parse(req.body);

    let previewImage = data.previewImage ?? null;
    // If a data-URI preview was sent and Cloudinary is configured, host it there
    if (previewImage?.startsWith("data:") && isCloudinaryConfigured()) {
      try {
        const uploaded = await uploadDataUri(previewImage);
        previewImage = uploaded.url;
      } catch {
        // keep the data URI as-is if the upload fails
      }
    }

    const design = await prisma.customDesign.create({
      data: {
        title: data.title,
        config: data.config,
        previewImage,
        customerName: data.customerName || null,
        phone: data.phone || null,
        status: data.status ?? "SUBMITTED",
      },
    });
    res.status(201).json(design);
  } catch (err) {
    next(err);
  }
});

// Public: fetch one design (to restore in customizer / attach to order)
router.get("/:id", async (req, res, next) => {
  try {
    const design = await prisma.customDesign.findUnique({ where: { id: req.params.id } });
    if (!design) return res.status(404).json({ message: "Design not found" });
    res.json(design);
  } catch (err) {
    next(err);
  }
});

// Admin: list designs
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where = status ? { status: status as never } : {};
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const [designs, total] = await Promise.all([
      prisma.customDesign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.customDesign.count({ where }),
    ]);
    res.json({
      designs,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// Admin: update design status
router.patch("/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const { status } = z
      .object({ status: z.enum(["DRAFT", "SUBMITTED", "REVIEWED", "ORDERED"]) })
      .parse(req.body);
    const design = await prisma.customDesign.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(design);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    await prisma.customDesign.delete({ where: { id: req.params.id } });
    res.json({ message: "Design deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
