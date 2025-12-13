// routes/users.js
import express from "express";
import { db } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

/**
 * GET /users/me
 * Fresh copy of the logged-in user's profile from DB
 */
router.get("/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = await db.collection("users").findOne({
      _id: new ObjectId(req.user.id),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...safeUser } = user;

    res.json({
      id: user._id.toString(),
      ...safeUser,
    });
  } catch (err) {
    console.error("GET /users/me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /users/me
 * Update profile of logged-in user
 */
router.put("/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // 🔒 Whitelist fields (important)
  const allowedFields = [
    "firstName",
    "lastName",
    "phone",
    "bio",
    "avatarUrl",
    "location",
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (typeof req.body[field] === "string") {
      updates[field] = req.body[field].trim();
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  try {
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: updates }
    );

    const updatedUser = await db.collection("users").findOne({
      _id: new ObjectId(req.user.id),
    });

    const { password, ...safeUser } = updatedUser;

    res.json({
      id: updatedUser._id.toString(),
      ...safeUser,
    });
  } catch (err) {
    console.error("PUT /users/me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /users/:id
 * Public profile of any user
 */
router.get("/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await db.collection("users").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hide sensitive fields
    const { password, email, ...publicUser } = user;

    res.json({
      id: user._id.toString(),
      ...publicUser,
    });
  } catch (err) {
    console.error("GET /users/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
