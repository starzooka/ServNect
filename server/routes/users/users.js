import express from "express";
import { usersDb } from "../../db/usersDb.js";
import { ObjectId } from "mongodb";
// ✅ 1. IMPORT THE MIDDLEWARE
import authMiddleware from "../../authMiddleware.js"; 

const router = express.Router();

// ✅ 2. INJECT MIDDLEWARE HERE
// Without this, req.user is undefined, causing the 401 error
router.get("/me", authMiddleware, async (req, res) => {
  
  if (!req.user || req.user.type !== "user") {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = await usersDb
      .collection("users")
      .findOne(
        { _id: new ObjectId(req.user.id) },
        { projection: { password: 0 } }
      );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id.toString(),
      ...user,
    });
  } catch (err) {
    console.error("GET /users/me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;