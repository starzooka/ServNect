// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === "production";

if (!JWT_SECRET) throw new Error("❌ JWT_SECRET missing in .env");

// ---------- SIGN UP ----------
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 12);

    const newUser = {
      firstName,
      lastName,
      email,
      password: hashed,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    return res.status(201).json({
      id: result.insertedId.toString(),
      firstName,
      lastName,
      email,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------- LOGIN ----------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.collection("users").findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    const { password: _pw, ...userData } = user;

    return res.json({
      token,
      user: { id: user._id.toString(), ...userData },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------- ME (quick current user) ----------
router.get("/me", (req, res) => {
  // authMiddleware already ran in server.js and set req.user (or null)
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  return res.json(req.user);
});

// ---------- LOGOUT ----------
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default router;
