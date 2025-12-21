import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { db } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(req, res, next) {
  try {
    let token = null;

    // 1️⃣ Read token (cookie OR bearer)
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2️⃣ No token → unauthenticated but don't crash
    if (!token) {
      req.user = null;
      return next();
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4️⃣ Fetch user (default = normal user)
    const collection =
      decoded.type === "expert" ? "experts" : "users";

    const record = await db
      .collection(collection)
      .findOne({ _id: new ObjectId(decoded.id) });

    if (!record) {
      req.user = null;
      return next();
    }

    // 5️⃣ Attach user safely
    req.user = {
      id: record._id.toString(),
      email: record.email,
      type: decoded.type || "user",
      firstName: record.firstName,
      lastName: record.lastName,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    req.user = null;
    next();
  }
}
