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
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.user.id) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...safeUser } = user;
    return res.json({ id: user._id.toString(), ...safeUser });
  } catch (err) {
    console.error("GET /users/me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /users/me
 * Update profile of logged-in user
 * Body can contain: firstName, lastName, phone, bio, avatarUrl, location, etc.
 */
router.put("/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const allowedFields = [
    "firstName",
    "lastName",
    "phone",
    "bio",
    "avatarUrl",
    "location",
  ];

  const updates = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
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

    const updated = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.user.id) });

    const { password, ...safeUser } = updated;
    return res.json({ id: updated._id.toString(), ...safeUser });
  } catch (err) {
    console.error("PUT /users/me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /users/:id
 * Public profile of any user by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, email, ...publicUser } = user; // hide password (and email if you want)
    return res.json({ id: user._id.toString(), ...publicUser });
  } catch (err) {
    console.error("GET /users/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
