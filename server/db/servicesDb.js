import clientPromise from "./mongoClient.js";

const SERVICES_DB = "Services";
const client = await clientPromise;

export const servicesDb = client.db(SERVICES_DB);
console.log(`✅ Services DB connected → ${SERVICES_DB}`);
