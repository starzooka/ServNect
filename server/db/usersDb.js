import clientPromise from "./mongoClient.js";

const USERS_DB = "Users";
const client = await clientPromise;

export const usersDb = client.db(USERS_DB);
console.log(`✅ Users DB connected → ${USERS_DB}`);
