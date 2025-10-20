import { MongoClient } from 'mongodb';
import 'dotenv/config'; // Make sure .env variables are loaded

// Get the connection string from .env
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('🔥 Please define the MONGO_URI environment variable inside .env');
}

// Create a new client instance
const client = new MongoClient(MONGO_URI);

let db;

try {
  // Use await to connect to the server
  // (This works because you have "type": "module" which allows top-level await)
  await client.connect();
  
  // Connect to the specific database you named in your URI
  // If no database is specified in the URI, it will use the default 'test' db
  db = client.db(); 
  
  console.log('✅ Connected successfully to MongoDB');
} catch (e) {
  console.error('❌ Could not connect to MongoDB', e);
  // If connection fails, exit the process
  process.exit(1); 
}

// Export the connected database instance
export { db };