import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { expertsDb } from "./db/expertsDb.js";
import { usersDb } from "./db/usersDb.js"; // 1. Import usersDb

const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // CHECK EXPERT
    if (decoded.type === "expert") {
      const expert = await expertsDb
        .collection("experts")
        .findOne({ _id: new ObjectId(decoded.id) });

      if (expert) {
        req.user = { id: expert._id.toString(), email: expert.email, type: "expert" };
      }
    }
    // 2. CHECK USER
    else if (decoded.type === "user") {
      const user = await usersDb
        .collection("users")
        .findOne({ _id: new ObjectId(decoded.id) });

      if (user) {
        req.user = { id: user._id.toString(), email: user.email, type: "user" };
      }
    }

    next();
  } catch (err) {
    req.user = null;
    next();
  }
}