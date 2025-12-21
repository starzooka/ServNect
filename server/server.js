import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import authMiddleware from "./authMiddleware.js";

// expert routes
import expertAuth from "./routes/experts/auth.js";
import expertsRoutes from "./routes/experts/experts.js";

// user routes
import userAuth from "./routes/users/auth.js";
import userRoutes from "./routes/users/users.js";

const app = express();
const PORT = process.env.PORT || 5050;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 🔥 AUTH MIDDLEWARE MUST COME BEFORE PROTECTED ROUTES
app.use(authMiddleware);

// expert routes
app.use("/auth/expert", expertAuth);
app.use("/experts", expertsRoutes);

// user routes
app.use("/auth/user", userAuth);
app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
