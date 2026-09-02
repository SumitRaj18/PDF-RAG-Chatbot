import { Router } from "express";
import { answerQuestion } from "../lib/rag.js";
import  requireAuth  from "../middleware/auth.js";
import Document from "../models/Document.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const { question, documentId } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Question is required." });
  }
  if (!documentId) {
    return res.status(400).json({ error: "documentId is required." });
  }

  try {
    // Ownership check: the document must exist AND belong to this user.
    const doc = await Document.findOne({ documentId, userId: req.userId });
    if (!doc) {
      return res.status(403).json({ error: "You don't have access to that document." });
    }

    const result = await answerQuestion({ question, documentId, userId: req.userId });
    res.json(result);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message || "Failed to answer question." });
  }
});

export default router;
