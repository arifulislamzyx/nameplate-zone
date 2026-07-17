import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import designRoutes from "./routes/design.routes";
import uploadRoutes from "./routes/upload.routes";
import contactRoutes from "./routes/contact.routes";
import statsRoutes from "./routes/stats.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

const allowedOrigins = (process.env.CLIENT_URL ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
// Design previews arrive as data-URI PNGs, so allow large JSON bodies
app.use(express.json({ limit: "15mb" }));

app.get("/", (_req, res) =>
  res.json({
    service: "Nameplate Zone API",
    status: "ok",
    health: "/api/health",
    endpoints: ["/api/products", "/api/categories", "/api/orders", "/api/designs", "/api/contact"],
  })
);
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "Nameplate Zone API" }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/stats", statsRoutes);

app.use(errorHandler);

export default app;
