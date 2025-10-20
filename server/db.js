import { MongoClient } from 'mongodb';
import 'dotenv/config';

// Get the connection string from .env
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('🔥 Please define the MONGO_URI environment variable inside .env');
}

// Use a single MongoClient instance globally
let client;
let db;

try {
  // Reuse the same connection if available (important for hot reloads and Render restarts)
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGO_URI);
    global._mongoClientPromise = client.connect();
  } else {
    client = await global._mongoClientPromise;
  }

  // Get the default database from the connection string
  db = client.db();

  console.log('✅ MongoDB connected successfully');
} catch (error) {
  console.error('❌ MongoDB connection failed:', error.message);
  process.exit(1); // Stop server if DB connection fails
}

export { db };
