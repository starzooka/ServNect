// db.js
import { MongoClient } from "mongodb";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "Users";

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI missing in .env");
}

const client = new MongoClient(MONGO_URI);
await client.connect();

console.log("✅ MongoDB connected");

const db = client.db(DB_NAME);

export { db };
