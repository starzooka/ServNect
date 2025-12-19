import express from "express";
import { expertsDb } from "../../db/expertsDb.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// ✅ GET Current Expert Profile
router.get("/me", async (req, res) => {
  if (!req.user || req.user.type !== "expert") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const expert = await expertsDb
      .collection("experts")
      .findOne(
        { _id: new ObjectId(req.user.id) },
        { projection: { password: 0 } }
      );

    if (!expert) return res.status(404).json({ message: "Expert not found" });

    res.json(expert);
  } catch (err) {
    console.error("Get expert error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT Update Expert Profile (Added this)
router.put("/me", async (req, res) => {
  if (!req.user || req.user.type !== "expert") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { firstName, lastName, specialty, bio, hourlyRate, location } = req.body;

    const updateDoc = {
      $set: {
        firstName,
        lastName,
        specialty,
        bio,
        hourlyRate,
        location,
        updatedAt: new Date(),
      },
    };

    const result = await expertsDb
      .collection("experts")
      .findOneAndUpdate(
        { _id: new ObjectId(req.user.id) },
        updateDoc,
        { returnDocument: "after", projection: { password: 0 } }
      );

    if (!result) {
      return res.status(404).json({ message: "Expert not found" });
    }

    // result directly contains the document in newer mongodb drivers, 
    // or result.value in older ones. Adjust based on your driver version.
    // For standard `findOneAndUpdate`, it usually returns the doc directly if using `returnDocument: 'after'`.
    res.json(result);

  } catch (err) {
    console.error("Update expert error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;