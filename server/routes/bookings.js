// server/routes/bookings.js
import express from "express";
import { db } from "../db.js";
import { ObjectId } from "mongodb";
import authMiddleware from "../authMiddleware.js";

const router = express.Router();

/**
 * POST /bookings
 * Client creates a booking
 */
router.post("/", authMiddleware, async (req, res) => {
  const { expertId, category } = req.body;

  if (!expertId || !category) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const booking = {
      userId: new ObjectId(req.user.id),
      expertId: new ObjectId(expertId),
      category,
      status: "pending",
      createdAt: new Date(),
    };

    await db.collection("bookings").insertOne(booking);

    res.json({ message: "Booking request sent ✅" });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * GET /bookings/client
 * Client sees their bookings
 */
router.get("/client", authMiddleware, async (req, res) => {
  try {
    const bookings = await db
      .collection("bookings")
      .find({ clientId: new ObjectId(req.user.id) })
      .toArray();

    res.json(
      bookings.map((b) => ({
        id: b._id.toString(),
        serviceId: b.serviceId,
        status: b.status,
        scheduledAt: b.scheduledAt,
      }))
    );
  } catch (err) {
    console.error("Client bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /bookings/expert
 * Expert sees bookings for their services
 */
router.get("/expert", authMiddleware, async (req, res) => {
  try {
    const bookings = await db
      .collection("bookings")
      .find({ expertId: new ObjectId(req.user.id) })
      .toArray();

    res.json(
      bookings.map((b) => ({
        id: b._id.toString(),
        clientId: b.clientId,
        status: b.status,
        scheduledAt: b.scheduledAt,
      }))
    );
  } catch (err) {
    console.error("Expert bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 PUT /bookings/:id/status
 Expert accepts/rejects booking
 */
router.put("/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const booking = await db
      .collection("bookings")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only expert can update
    if (booking.expertId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await db
      .collection("bookings")
      .updateOne(
        { _id: booking._id },
        { $set: { status } }
      );

    res.json({ message: "Booking updated", status });
  } catch (err) {
    console.error("Update booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { expertId, category } = req.body;

  if (!expertId || !category) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const booking = {
      userId: new ObjectId(req.user.id),
      expertId: new ObjectId(expertId),
      category,
      status: "pending",
      createdAt: new Date(),
    };

    await db.collection("bookings").insertOne(booking);

    res.json({ message: "Booking request sent ✅" });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /bookings/my
 * User's bookings
 */
router.get("/my", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const bookings = await db
      .collection("bookings")
      .find({ userId: new ObjectId(req.user.id) })
      .toArray();

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
