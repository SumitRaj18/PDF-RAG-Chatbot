import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./lib/db.js";
import authRoute from "./routes/auth.js";
import uploadRoute from "./routes/upload.js";
import chatRoute from "./routes/chat.js";
import documentsRoute from "./routes/documents.js";
import cookieParser from 'cookie-parser'
import passport from "passport";
import './config/passport.js'
const app = express();

app.use(passport.initialize());  // ← also required, or authenticate() throws differently
app.use(cors({
  origin:'https://pdf-rag-chatbot-opal.vercel.app',
  credentials:true
}));
app.use(cookieParser())
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/chat", chatRoute);
app.use("/api/documents", documentsRoute);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
