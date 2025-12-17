import clientPromise from "./mongoClient.js";

const EXPERTS_DB = "Experts";
const client = await clientPromise;

export const expertsDb = client.db(EXPERTS_DB);
console.log(`✅ Experts DB connected → ${EXPERTS_DB}`);
