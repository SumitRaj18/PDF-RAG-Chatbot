// middleware/auth.js
import jwt from "jsonwebtoken";

export default function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.sub; // matches your issueToken's { sub: ... } payload
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}