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
router.delete('/:id', async (req,res) => {
  const {id} = req.params;

  const deleteDoc = await Document.findByIdAndDelete({_id:id,userId:req.userId})
  return res.json({msg:'Deleted'})
})

export default router;