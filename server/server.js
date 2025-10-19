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
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  '/',
  cors({
    origin: 'https://servnect.vercel.app/', // frontend origin
    credentials: true, // allow cookies
  }),
  express.json(),
  cookieParser(),
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      const token = req.cookies.token;
      let user = null;

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          const userData = await db
            .collection('users')
            .findOne({ _id: new ObjectId(decoded.userId) });

          if (userData) {
            // remove password field
            const { password, ...userWithoutPassword } = userData;
            user = { ...userWithoutPassword, id: userData._id.toString() };
          }
        } catch (err) {
          console.error('Invalid or expired token:', err.message);
        }
      }

      return { req, res, db, user };
    },
  }),
);

await new Promise((resolve) =>
  httpServer.listen({ port: process.env.PORT || 4000 }, resolve),
);

console.log(`🚀 Server ready at http://localhost:4000/`);
