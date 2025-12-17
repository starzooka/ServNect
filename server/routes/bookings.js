import express from "express";
import { bookingsDb } from "../db/bookingsDb.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const bookings = await bookingsDb.collection("bookings").find().toArray();
  res.json(bookings);
});

export default router;
