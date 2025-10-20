// index.js
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';

import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { db } from './db.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn(
    '⚠️ JWT_SECRET not defined in environment variables. Using default insecure key.'
  );
}

// ------------------- CORS & Middleware -------------------

// Allow frontend origins (local + production)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl or Postman)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:5173',        // local dev
        'https://servnect.vercel.app'   // production frontend
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // allow cookies
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

      if (token && JWT_SECRET) {
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

      return { req, res, db, user };
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
