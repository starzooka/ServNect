import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { expertsDb } from "./db/expertsDb.js";

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

    if (decoded.type === "expert") {
      const expert = await expertsDb
        .collection("experts")
        .findOne({ _id: new ObjectId(decoded.id) });

      if (!expert) {
        req.user = null;
        return next();
      }

      req.user = {
        id: expert._id.toString(),
        email: expert.email,
        type: "expert",
      };
    }

    next();
  } catch {
    req.user = null;
    next();
  }
}
