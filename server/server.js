// server.js
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './authMiddleware.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

const app = express();
const httpServer = http.createServer(app);
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error(
    '🔴 FATAL ERROR: JWT_SECRET not defined in .env file. Shutting down.'
  );
  process.exit(1);
}

// ------------------- CORS & Middleware -------------------

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        // 'http://localhost:5173',
        "https://servnect.vercel.app"
      ];
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Attach user (like GraphQL context did)
app.use(authMiddleware);

// ------------------- REST Routes -------------------

// Auth (signup, login, logout)
app.use('/auth', authRoutes);

// Users (get all, get by id, me)
app.use('/users', userRoutes);

// ------------------- Health Check -------------------

app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong', timestamp: new Date() });
});

// ------------------- Start Server -------------------

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Express server ready at port ${PORT}`);
});
