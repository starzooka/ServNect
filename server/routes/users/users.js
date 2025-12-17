import express from "express";
import { usersDb } from "../../db/usersDb.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/me", async (req, res) => {
  if (!req.user || req.user.type !== "user")
    return res.status(401).json({ message: "Unauthorized" });

router.get("/me/current", async (req, res) => {
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
    console.error("GET /users/me/current error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


  const user = await usersDb
    .collection("users")
    .findOne({ _id: new ObjectId(req.user.id) }, { projection: { password: 0 } });

  res.json(user);
});

export default router;
