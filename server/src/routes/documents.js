import { Router } from "express";
import  requireAuth  from "../middleware/auth.js";
import Document from "../models/Document.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("documentId fileName chunks createdAt");

    res.json({ documents: docs });
  } catch (err) {
    console.error("List documents error:", err);
    res.status(500).json({ error: "Failed to list documents." });
  }
});
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleteDoc = await Document.findOneAndDelete({ _id: id, userId: req.userId });

    if (!deleteDoc) {
      return res.status(404).json({ error: "Document not found." });
    }

    return res.json({ msg: 'Deleted', documentId: deleteDoc._id });
  } catch (err) {
    console.error("Delete document error:", err);
    res.status(500).json({ error: "Failed to delete document." });
  }
});

export default router;