import express from "express";
import { servicesDb } from "../db/servicesDb.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const services = await servicesDb.collection("services").find().toArray();
  res.json(services);
});

export default router;
