import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    documentId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String, required: true },
    chunks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
