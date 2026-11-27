import { Router } from "express";
import { timingSafeEqual } from "crypto";
import { prisma } from "../lib/prisma";
import { mapCourierStatus } from "../lib/steadfast";

const router = Router();

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
};

/**
 * Steadfast delivery-status webhook.
 * Register this URL in the Steadfast portal:  https://<backend-domain>/api/webhooks/steadfast
 * and use the same value as STEADFAST_WEBHOOK_TOKEN for the Bearer token.
 */
router.post("/steadfast", async (req, res, next) => {
  try {
    const expected = process.env.STEADFAST_WEBHOOK_TOKEN?.trim();
    if (!expected) {
      return res.status(503).json({ status: "error", message: "Webhook not configured" });
    }
    const header = req.get("authorization") ?? "";
    if (!safeEqual(header, `Bearer ${expected}`)) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const consignmentId = body.consignment_id != null ? String(body.consignment_id) : "";
    const invoice = typeof body.invoice === "string" ? body.invoice : "";
    const courierStatus = typeof body.status === "string" ? body.status.toLowerCase() : "";

    if (!courierStatus || (!consignmentId && !invoice)) {
      // Other notification types (e.g. tracking messages) — acknowledge and ignore.
      return res.json({ status: "success", message: "Ignored" });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(consignmentId ? [{ consignmentId }] : []),
          ...(invoice ? [{ orderNumber: invoice }] : []),
        ],
      },
    });
    if (!order) return res.json({ status: "success", message: "Order not found, ignored" });

    const mapped = mapCourierStatus(courierStatus);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        courierStatus,
        ...(consignmentId && !order.consignmentId ? { consignmentId, courier: "steadfast" } : {}),
        ...(mapped ? { status: mapped } : {}),
      },
    });
    res.json({ status: "success", message: "Webhook received" });
  } catch (err) {
    next(err);
  }
});

export default router;
