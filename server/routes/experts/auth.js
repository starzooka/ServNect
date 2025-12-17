import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { expertsDb } from "../../db/expertsDb.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === "production";

/* =========================
   EXPERT REGISTER
========================= */
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      service,
      dob,
      location,
      password,
    } = req.body;

    if (!email || !password || !service) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await expertsDb
      .collection("experts")
      .findOne({ email });

    if (exists) {
      return res.status(400).json({ message: "Expert already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const expert = {
      firstName,
      lastName,
      email,
      phone,
      service,
      dob,
      location,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await expertsDb
      .collection("experts")
      .insertOne(expert);

    // auto-login after register
    const token = jwt.sign(
      { id: result.insertedId.toString(), type: "expert" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      expert: {
        id: result.insertedId.toString(),
        email,
      },
    });
  } catch (err) {
    console.error("Expert register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   EXPERT LOGIN  ✅ REQUIRED
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password required" });
    }

    const expert = await expertsDb
      .collection("experts")
      .findOne({ email });

    if (!expert) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, expert.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: expert._id.toString(), type: "expert" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      expert: {
        id: expert._id.toString(),
        email: expert.email,
      },
    });
  } catch (err) {
    console.error("Expert login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
