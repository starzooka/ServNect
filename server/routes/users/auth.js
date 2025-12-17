import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { usersDb } from "../../db/usersDb.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });

  const exists = await usersDb.collection("users").findOne({ email });
  if (exists) return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 12);

  const user = {
    firstName,
    lastName,
    email,
    password: hashed,
    role: "user",
    createdAt: new Date(),
  };

  const result = await usersDb.collection("users").insertOne(user);

  res.status(201).json({ id: result.insertedId });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await usersDb.collection("users").findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, type: "user" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, { httpOnly: true });
  res.json({ message: "Logged in" });
});

export default router;
