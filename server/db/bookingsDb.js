import clientPromise from "./mongoClient.js";

const BOOKINGS_DB = "Bookings";
const client = await clientPromise;

export const bookingsDb = client.db(BOOKINGS_DB);
console.log(`✅ Bookings DB connected → ${BOOKINGS_DB}`);
