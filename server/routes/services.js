import express from "express";
import { db } from "../db.js";
import { ObjectId } from "mongodb";
import authMiddleware from "../authMiddleware.js";

const router = express.Router();

/**
 * POST /services
 * Expert creates a service
 * Body: { title, description, category, basePrice }
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Only experts should create services. If you don't have roles yet, allow all.
    // If role exists on req.user: uncomment check below.
    // if (req.user.role !== 'expert') return res.status(403).json({ message: 'Only experts can create services' });

    const { title, description, category, basePrice } = req.body;
    if (!title || !basePrice) {
      return res.status(400).json({ message: "title and basePrice required" });
    }

    const service = {
      title,
      description: description || "",
      category: category || "general",
      basePrice: Number(basePrice),
      expertId: new ObjectId(req.user.id),
      createdAt: new Date(),
      isActive: true,
    };

    const result = await db.collection("services").insertOne(service);
    service.id = result.insertedId.toString();
    res.status(201).json(service);
  } catch (err) {
    console.error("POST /services error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /services
 * Public listing of active services (with expert info)
 * Query params: ?category=...&q=...
 */
router.get("/", async (req, res) => {
  try {
    const { category, q } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (q) filter.title = { $regex: q, $options: "i" };

    const services = await db
      .collection("services")
      .find(filter)
      .toArray();

    // populate expert fields
    const expertIds = [...new Set(services.map(s => s.expertId.toString()))].map(id => new ObjectId(id));
    const experts = await db
      .collection("users")
      .find({ _id: { $in: expertIds } })
      .project({ password: 0 })
      .toArray();

    const expertMap = Object.fromEntries(experts.map(e => [e._id.toString(), e]));

    const out = services.map(s => ({
      id: s._id.toString(),
      title: s.title,
      description: s.description,
      category: s.category,
      basePrice: s.basePrice,
      isActive: s.isActive,
      expert: expertMap[s.expertId.toString()] ? {
        id: expertMap[s.expertId.toString()]._id.toString(),
        firstName: expertMap[s.expertId.toString()].firstName,
        lastName: expertMap[s.expertId.toString()].lastName,
        // include other public expert fields if present
      } : null,
      createdAt: s.createdAt
    }));

    res.json(out);
  } catch (err) {
    console.error("GET /services error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /services/me
 * Expert sees his/her services
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const services = await db
      .collection("services")
      .find({ expertId: new ObjectId(req.user.id) })
      .toArray();

    const out = services.map(s => ({
      id: s._id.toString(),
      title: s.title,
      description: s.description,
      category: s.category,
      basePrice: s.basePrice,
      isActive: s.isActive,
      createdAt: s.createdAt
    }));

    res.json(out);
  } catch (err) {
    console.error("GET /services/me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /services/:id
 * Get single service
 */
router.get("/:id", async (req, res) => {
  try {
    const s = await db.collection("services").findOne({ _id: new ObjectId(req.params.id) });
    if (!s) return res.status(404).json({ message: "Service not found" });
    const expert = await db.collection("users").findOne({ _id: s.expertId }, { projection: { password: 0 } });
    res.json({
      id: s._id.toString(),
      title: s.title,
      description: s.description,
      category: s.category,
      basePrice: s.basePrice,
      isActive: s.isActive,
      expert: expert ? { id: expert._id.toString(), firstName: expert.firstName, lastName: expert.lastName } : null,
      createdAt: s.createdAt
    });
  } catch (err) {
    console.error("GET /services/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
