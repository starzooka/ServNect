import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { usersDb } from "../../db/usersDb.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await usersDb.collection("users").findOne({ email });
    if (exists) return res.status(400).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 12);

    const user = {
      firstName,
      lastName,
      email,
      password: hashed,
      role: "user",
      createdAt: new Date(),
    };

    const result = await usersDb.collection("users").insertOne(user);

    // ✅ Generate Token for Auto-Login
    const token = jwt.sign(
      { id: result.insertedId.toString(), type: "user" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Return Token + User Data
    res.status(201).json({
      token,
      user: {
        id: result.insertedId.toString(),
        email,
        firstName,
        lastName,
        role: "user",
      },
    });
  } catch (err) {
    console.error("User register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await usersDb.collection("users").findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id.toString(), type: "user" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ CHANGED: Send token in body, NO cookie
    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: "user",
      },
    });
  } catch (err) {
    console.error("User login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGOUT (Optional stateless endpoint)
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

export default router;