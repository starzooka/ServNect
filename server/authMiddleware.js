import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { expertsDb } from "./db/expertsDb.js";
import { usersDb } from "./db/usersDb.js";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(req, res, next) {
  try {
    let token;

    // ✅ 1. Check Authorization Header FIRST (Priority)
    // This allows LocalStorage auth to work even if an old cookie exists
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // ⚠️ 2. Fallback to Cookie (Legacy/Backup)
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      req.user = null;
      return next();
    }

    // Verify Token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 🔍 CHECK EXPERT
    if (decoded.type === "expert") {
      const expert = await expertsDb
        .collection("experts")
        .findOne({ _id: new ObjectId(decoded.id) });

      if (expert) {
        req.user = {
          id: expert._id.toString(),
          email: expert.email,
          type: "expert",
        };
      }
    }
    // 🔍 CHECK USER
    else if (decoded.type === "user") {
      const user = await usersDb
        .collection("users")
        .findOne({ _id: new ObjectId(decoded.id) });

      if (user) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          type: "user",
        };
      }
    }

    next();
  } catch (err) {
    // If token is invalid or expired
    req.user = null;
    next();
  }
}