// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import authMiddleware from "./authMiddleware.js";
import "./db.js";
import servicesRoutes from "./routes/services.js";
import bookingsRoutes from "./routes/bookings.js";

const app = express();
const PORT = process.env.PORT || 5050;

// ---------------- CORS ----------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://servnect.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Attach user from JWT (will set req.user or null)
app.use(authMiddleware);
app.use("/services", servicesRoutes);
app.use("/bookings", bookingsRoutes);

//Routes
app.get("/ping", (req, res) => res.json({ message: "pong", timestamp: new Date() }));

// Auth (signup, login, logout, /me)
app.use("/auth", authRoutes);

// Users (me/current, list, by id)
app.use("/users", userRoutes);



//Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
