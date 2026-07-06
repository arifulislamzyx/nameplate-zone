import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/auth";

const router = Router();

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-") || `product-${Date.now()}`;

const sizeSchema = z.object({
  label: z.string(),
  price: z.number().nonnegative(),
});

const productSchema = z.object({
  name: z.string().min(1),
  nameBn: z.string().optional().nullable(),
  description: z.string().min(1),
  descriptionBn: z.string().optional().nullable(),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional().nullable(),
  images: z.array(z.string()).default([]),
  material: z.string().default("Acrylic"),
  shape: z.string().default("RECTANGLE"),
  sizes: z.array(sizeSchema).default([]),
  features: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
  categoryId: z.string().min(1),
});

// Public list with filters: ?category=slug&featured=true&search=&sort=price_asc|price_desc|newest&page=&limit=
router.get("/", async (req, res, next) => {
  try {
    const { category, featured, search, sort, page = "1", limit = "12" } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (category) where.category = { slug: category };
    if (featured === "true") where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameBn: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    const orderBy =
      sort === "price_asc"
        ? { price: "asc" as const }
        : sort === "price_desc"
          ? { price: "desc" as const }
          : { createdAt: "desc" as const };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(48, Math.max(1, parseInt(limit) || 12));

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: { category: { select: { name: true, nameBn: true, slug: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { category: { select: { name: true, nameBn: true, slug: true } } },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, inStock: true },
      take: 4,
      include: { category: { select: { name: true, slug: true } } },
    });

    res.json({ product, related });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    let slug = slugify(data.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;
    const product = await prisma.product.create({ data: { ...data, slug } });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
