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

    // ✅ No token → treat as logged out, but allow request
    if (!token) {
      req.user = null;
      return next();
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      req.user = null;
      return next();
    }

    const { password, ...userdata } = user;
    req.user = { id: user._id.toString(), ...userdata };

    next();
  } catch (err) {
    console.log("AUTH ERROR:", err.message);
    // ✅ Invalid/expired token → just clear user, don’t 401
    req.user = null;
    return next();
  }
}

export default authMiddleware;
