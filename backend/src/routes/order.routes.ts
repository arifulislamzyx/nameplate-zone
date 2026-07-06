import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/auth";

const router = Router();

const orderItemSchema = z.object({
  productId: z.string().optional().nullable(),
  designId: z.string().optional().nullable(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive().default(1),
  size: z.string().optional().nullable(),
  customization: z.any().optional().nullable(),
});

const createOrderSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().min(5),
  city: z.string().min(2),
  note: z.string().optional().nullable(),
  deliveryCharge: z.number().nonnegative().default(0),
  items: z.array(orderItemSchema).min(1),
});

const generateOrderNumber = () => {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `NZ-${ymd}-${rand}`;
};

// Public: place order
router.post("/", async (req, res, next) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const subtotal = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName: data.customerName,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        city: data.city,
        note: data.note || null,
        subtotal,
        deliveryCharge: data.deliveryCharge,
        total: subtotal + data.deliveryCharge,
        items: {
          create: data.items.map((i) => ({
            productId: i.productId || null,
            designId: i.designId || null,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            size: i.size || null,
            customization: i.customization ?? undefined,
          })),
        },
      },
      include: { items: true },
    });

    // Mark any attached custom designs as ordered
    const designIds = data.items.map((i) => i.designId).filter(Boolean) as string[];
    if (designIds.length) {
      await prisma.customDesign.updateMany({
        where: { id: { in: designIds } },
        data: { status: "ORDERED" },
      });
    }

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// Public: track order by order number + phone
router.get("/track", async (req, res, next) => {
  try {
    const { orderNumber, phone } = req.query as Record<string, string>;
    if (!orderNumber || !phone) {
      return res.status(400).json({ message: "orderNumber and phone are required" });
    }
    const order = await prisma.order.findFirst({
      where: { orderNumber, phone },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// Admin: list orders
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where = status ? { status: status as never } : {};
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: { items: true },
      }),
      prisma.order.count({ where }),
    ]);
    res.json({
      orders,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// Admin: single order
router.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true, design: true } } },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// Admin: update status
router.patch("/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const { status } = z
      .object({
        status: z.enum(["PENDING", "CONFIRMED", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"]),
      })
      .parse(req.body);
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } });
    res.json({ message: "Order deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
