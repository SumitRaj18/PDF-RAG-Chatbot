import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { ingestPdf } from "../lib/rag.js";
import requireAuth from "../middleware/auth.js";
import Document from "../models/Document.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_ROOT = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const userDir = path.join(UPLOAD_ROOT, req.userId);
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed."));
    }
    cb(null, true);
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const MAX_DOCS_PER_USER = 20;

const router = Router();

router.post("/", requireAuth, upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded." });
  }

  try {
    const existingCount = await Document.countDocuments({ userId: req.userId });
    if (existingCount >= MAX_DOCS_PER_USER) {
      fs.unlinkSync(req.file.path);
      return res.status(429).json({
        error: `You've reached the limit of ${MAX_DOCS_PER_USER} documents.`,
      });
    }

    const documentId = uuidv4();

    const { chunks } = await ingestPdf({
      filePath: req.file.path,
      documentId,
      userId: req.userId,
    });

    await Document.create({
      documentId,
      userId: req.userId,
      fileName: req.file.originalname,
      chunks,
    });

    res.json({
      documentId,
      fileName: req.file.originalname,
      chunks,
      message: "PDF ingested successfully.",
    });
  } catch (err) {
    console.error("Ingestion error:", err);
    res.status(500).json({ error: err.message || "Failed to ingest PDF." });
  }
});

export default router;
