// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js"; // ← YOUR FILE
import "./db.js"; // connect to DB

const app = express();
const PORT = process.env.PORT || 5050;

// ---------------- CORS FIX ----------------
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ---------------- Routes -------------------
app.get("/ping", (req, res) => res.json({ message: "pong" }));
app.use("/api/auth", authRoutes);

// ---------------- Start Server --------------
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
