import express from "express";
import { db } from "../db.js";
import { ObjectId } from "mongodb";
import authMiddleware from "../authMiddleware.js";

const router = express.Router();

router.post("/register", authMiddleware, async (req, res) => {
  const { category, experience, location, phone } = req.body;

  if (!category || !experience || !location || !phone) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const expert = {
      userId: new ObjectId(req.user.id),
      category,
      experience,
      location,
      phone,
      createdAt: new Date(),
    };

    await db.collection("experts").insertOne(expert);

    // Update user role
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { role: "expert" } }
    );

    res.json({ message: "Expert registered successfully" });
  } catch (err) {
    console.error("Expert register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
