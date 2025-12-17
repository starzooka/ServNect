import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import expertAuth from "./routes/experts/auth.js";
import expertsRoutes from "./routes/experts/experts.js";
import authMiddleware from "./authMiddleware.js";

const app = express();
const PORT = process.env.PORT || 5050;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);

app.use("/auth/expert", expertAuth); // ✅ IMPORTANT
app.use("/experts", expertsRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
