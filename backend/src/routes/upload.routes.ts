import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../middleware/auth";
import { isCloudinaryConfigured, uploadImage } from "../lib/cloudinary";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.post("/", requireAdmin, upload.array("images", 6), async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        message:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env",
      });
    }
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (!files.length) return res.status(400).json({ message: "No files uploaded" });
    const results = await Promise.all(files.map((f) => uploadImage(f.buffer)));
    res.json({ images: results });
  } catch (err) {
    next(err);
  }
});

export default router;
