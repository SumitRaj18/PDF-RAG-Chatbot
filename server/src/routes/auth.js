import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import passport from "passport";
import requireAuth from "../middleware/auth.js";

const router = Router();

const isProduction = process.env.NODE_ENV === "production";

// Updated Cookie Configuration for Cross-Domain Production (Vercel <-> Render)
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction, // Required to be true when sameSite is "none"
  sameSite: isProduction ? "none" : "lax", // Allows cross-site cookie transmission in production
  maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
};

function issueToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Email and a password (min 8 chars) are required." });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
    });

    const token = issueToken(user);

    return res
      .status(201)
      .cookie("token", token, COOKIE_OPTIONS)
      .json({
        user: { id: user._id, email: user.email, token },
        msg: "Account created successfully",
      });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to create account." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = issueToken(user);

    return res
      .status(200)
      .cookie("token", token, COOKIE_OPTIONS)
      .json({
        user: { id: user._id, email: user.email },
        msg: "Logged in successfully",
      });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to log in." });
  }
});

router.post("/logout", (req, res) => {
  return res
    .clearCookie("token", COOKIE_OPTIONS)
    .json({ msg: "Logged out successfully" });
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const token = issueToken(req.user);
    res.cookie("token", token, COOKIE_OPTIONS);

    const clientUrl = "https://pdf-rag-chatbot-opal.vercel.app";
    res.redirect(`${clientUrl}/oauth-success?token=${token}`);
  }
);

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

export default router;