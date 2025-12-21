import express from "express";
import { expertsDb } from "../../db/expertsDb.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/me", async (req, res) => {
  if (!req.user || req.user.type !== "expert") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const expert = await expertsDb
    .collection("experts")
    .findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );

  res.json(expert);
});

export default router;
