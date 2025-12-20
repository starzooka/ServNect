import express from "express";
import { db } from "../db.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET all users
router.get("/users", adminMiddleware, async (req, res) => {
  const users = await db.collection("users").find().toArray();
  res.json(users.map(u => ({
    id: u._id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.role || "user",
  })));
});

// GET all bookings
router.get("/bookings", adminMiddleware, async (req, res) => {
  const bookings = await db.collection("bookings").find().toArray();
  res.json(bookings);
});

// DELETE user
router.delete("/users/:id", adminMiddleware, async (req, res) => {
  await db.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ message: "User deleted" });
});

export default router;
