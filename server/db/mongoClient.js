// db/mongoClient.js
import { MongoClient } from "mongodb";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI missing in .env");
}

const client = new MongoClient(MONGO_URI);

const clientPromise = client.connect()
  .then(() => {
    console.log("✅ MongoDB Cluster connected");
    return client;
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  });

export default clientPromise;
