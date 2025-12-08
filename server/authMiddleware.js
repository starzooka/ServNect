// authMiddleware.js
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error(
    '🔴 FATAL ERROR: JWT_SECRET not defined in .env file. Shutting down.'
  );
  process.exit(1);
}

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const userData = await db
      .collection('users')
      .findOne({ _id: new ObjectId(String(decoded.userId)) });

    if (!userData) {
      req.user = null;
      return next();
    }

    const { password, ...userWithoutPassword } = userData;
    req.user = { ...userWithoutPassword, id: userData._id.toString() };

    next();
  } catch (err) {
    console.error('Invalid or expired token:', err.message);
    req.user = null;
    next();
  }
};
