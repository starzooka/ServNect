// authMiddleware.js
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { db } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET;

async function authMiddleware(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) return res.status(401).json({ message: "User not found" });

    const { password, ...userdata } = user;
    req.user = { id: user._id.toString(), ...userdata };

    next();
  } catch (err) {
    console.log("AUTH ERROR:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export default authMiddleware;  // ← FIXED EXPORT
