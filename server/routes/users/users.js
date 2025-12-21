
import express from "express";
import { db } from "../../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

/**
 * UPDATE PROFILE
 * PUT /users/me
 */
router.put("/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { firstName, lastName, phone, bio } = req.body;

  try {
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user.id) },
      {
        $set: {
          firstName,
          lastName,
          phone,
          bio,
          updatedAt: new Date(),
        },
      }
    );

    const updatedUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.user.id) });

    const { password, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
