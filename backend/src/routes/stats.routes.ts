import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", requireAdmin, async (_req, res, next) => {
  try {
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      totalDesigns,
      unreadMessages,
      revenueAgg,
      recentOrders,
      recentDesigns,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.customDesign.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ["CANCELLED"] } },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { items: true },
      }),
      prisma.customDesign.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    // Orders per day over the last 30 days
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const orders30d = await prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, total: true },
    });
    const dailyMap = new Map<string, { orders: number; revenue: number }>();
    for (const o of orders30d) {
      const key = o.createdAt.toISOString().slice(0, 10);
      const entry = dailyMap.get(key) ?? { orders: 0, revenue: 0 };
      entry.orders += 1;
      entry.revenue += o.total;
      dailyMap.set(key, entry);
    }
    const daily = [...dailyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));

    res.json({
      totals: {
        products: totalProducts,
        categories: totalCategories,
        orders: totalOrders,
        pendingOrders,
        designs: totalDesigns,
        unreadMessages,
        revenue: revenueAgg._sum.total ?? 0,
      },
      daily,
      recentOrders,
      recentDesigns,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
