
import express from "express";
import { db } from "../db.js";
import { ObjectId } from "mongodb";
import authMiddleware from "../authMiddleware.js";

const router = express.Router();

/**
 * POST /bookings
 * Client creates a booking
 * Body: { serviceId, scheduledAt (ISO string), notes }
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { serviceId, scheduledAt, notes } = req.body;
    if (!serviceId || !scheduledAt) return res.status(400).json({ message: "serviceId and scheduledAt required" });

    const service = await db.collection("services").findOne({ _id: new ObjectId(serviceId) });
    if (!service) return res.status(404).json({ message: "Service not found" });

    const booking = {
      clientId: new ObjectId(req.user.id),
      expertId: service.expertId,
      serviceId: new ObjectId(serviceId),
      scheduledAt: new Date(scheduledAt),
      notes: notes || "",
      status: "pending", // pending | accepted | rejected | completed | cancelled
      createdAt: new Date()
    };

    const result = await db.collection("bookings").insertOne(booking);
    booking.id = result.insertedId.toString();
    res.status(201).json(booking);
  } catch (err) {
    console.error("POST /bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /bookings/client
 * Client sees their bookings
 */
router.get("/client", authMiddleware, async (req, res) => {
  try {
    const bookings = await db.collection("bookings")
      .find({ clientId: new ObjectId(req.user.id) })
      .toArray();

    const out = await Promise.all(bookings.map(async b => {
      const service = await db.collection("services").findOne({ _id: b.serviceId });
      const expert = await db.collection("users").findOne({ _id: b.expertId }, { projection: { password: 0 } });
      return {
        id: b._id.toString(),
        status: b.status,
        scheduledAt: b.scheduledAt,
        notes: b.notes,
        createdAt: b.createdAt,
        service: service ? { id: service._id.toString(), title: service.title } : null,
        expert: expert ? { id: expert._id.toString(), firstName: expert.firstName, lastName: expert.lastName } : null
      };
    }));

    res.json(out);
  } catch (err) {
    console.error("GET /bookings/client error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /bookings/expert
 * Expert sees bookings assigned to them
 */
router.get("/expert", authMiddleware, async (req, res) => {
  try {
    const bookings = await db.collection("bookings")
      .find({ expertId: new ObjectId(req.user.id) })
      .toArray();

    const out = await Promise.all(bookings.map(async b => {
      const service = await db.collection("services").findOne({ _id: b.serviceId });
      const client = await db.collection("users").findOne({ _id: b.clientId }, { projection: { password: 0 } });
      return {
        id: b._id.toString(),
        status: b.status,
        scheduledAt: b.scheduledAt,
        notes: b.notes,
        createdAt: b.createdAt,
        service: service ? { id: service._id.toString(), title: service.title } : null,
        client: client ? { id: client._id.toString(), firstName: client.firstName, lastName: client.lastName } : null
      };
    }));

    res.json(out);
  } catch (err) {
    console.error("GET /bookings/expert error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /bookings/:id/status
 * Expert updates booking status (accepted/rejected/completed)
 * Body: { status: "accepted" }
 */
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["accepted", "rejected", "completed", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(req.params.id) });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only expert can change booking status
    if (booking.expertId.toString() !== req.user.id) return res.status(403).json({ message: "Not allowed" });

    await db.collection("bookings").updateOne({ _id: booking._id }, { $set: { status } });
    const updated = await db.collection("bookings").findOne({ _id: booking._id });

    res.json({ id: updated._id.toString(), status: updated.status });
  } catch (err) {
    console.error("PUT /bookings/:id/status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
