import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import expertAuth from "./routes/experts/auth.js";
import expertsRoutes from "./routes/experts/experts.js";
import userAuth from "./routes/users/auth.js"; 
import userRoutes from "./routes/users/users.js";

import authMiddleware from "./authMiddleware.js";

import adminRoutes from "./routes/admin.js";




const app = express();
const PORT = process.env.PORT || 5050;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);

// --- REGISTER ROUTES ---
app.use("/auth/expert", expertAuth);
app.use("/experts", expertsRoutes);

// 2. REGISTER USER ROUTES
app.use("/auth/user", userAuth); // login/register
app.use("/users", userRoutes);   // profile/me

app.use("/admin", adminRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);