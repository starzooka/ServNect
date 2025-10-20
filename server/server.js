// server.js
import dotenv from 'dotenv';
dotenv.config();
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { db } from './db.js';

const app = express();
const httpServer = http.createServer(app);
const JWT_SECRET = process.env.JWT_SECRET; // This is now loaded correctly

if (!JWT_SECRET) {
  console.error(
    '🔴 FATAL ERROR: JWT_SECRET not defined in .env file. Shutting down.'
  );
  process.exit(1); // Exit if the secret is missing
}

// ------------------- CORS & Middleware -------------------

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        'http://localhost:5173',
        // 'https://servnect.vercel.app'
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

// ------------------- Apollo Server -------------------

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

// GraphQL middleware with context (for auth)
app.use(
  '/',
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      const token = req.cookies.token;
      let user = null;

      if (token) { // We can safely use JWT_SECRET here
        try {
          const decoded = jwt.verify(token, JWT_SECRET);

          const userData = await db
            .collection('users')
            .findOne({ _id: new ObjectId(String(decoded.userId)) });

          if (userData) {
            const { password, ...userWithoutPassword } = userData;
            user = { ...userWithoutPassword, id: userData._id.toString() };
          }
        } catch (err) {
          console.error('Invalid or expired token:', err.message);
        }
      }

      // ✅ FIX: Pass the loaded JWT_SECRET to the resolvers
      return { req, res, db, user, JWT_SECRET };
    },
  })
);

// ------------------- Health Check (Optional) -------------------

app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong', timestamp: new Date() });
});

// ------------------- Start Server -------------------

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at port ${PORT}`);
});