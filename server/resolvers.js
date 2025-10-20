// src/resolvers.js
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET; // 👈 ✅ FIX: Removed this line
const isProduction = process.env.NODE_ENV === "production";

export const resolvers = {
  Query: {
    // ... (no changes)
    getUsers: async (parent, args, { db }) => {
      const users = await db.collection("users").find().toArray();
      return users.map(({ _id, password, ...rest }) => ({
        id: _id.toString(),
        ...rest,
      }));
    },
    getUserById: async (parent, { id }, { db }) => {
      // ... (implementation not shown, but no changes needed)
    },
    me: async (parent, args, { user }) => {
      if (!user) return null;
      return user;
    },
  },

  Mutation: {
    // ... (no changes to createUser)
    createUser: async (parent, args, { db }) => {
      // ... (implementation not shown, but no changes needed)
    },

    // ✅ FIX: Destructure JWT_SECRET from the context object
    login: async (parent, { email, password }, { db, res, JWT_SECRET }) => {
      try {
        const user = await db.collection("users").findOne({ email });
        if (!user) throw new Error("Invalid email or password");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Invalid email or password");

        // This JWT_SECRET now comes from the context, so it's guaranteed to be defined
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        });

        // This cookie logic is correct from our previous fixes
        res.cookie("token", token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        const { password: _, ...userWithoutPassword } = user;

        return {
          token,
          user: {
            id: user._id.toString(),
            ...userWithoutPassword,
          },
        };
      } catch (err) {
        console.error("Login error:", err.message);
        throw new Error(err.message || "Login failed");
      }
    },

    logout: async (parent, args, { res }) => {
      // This logic is correct
      res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      });
      return true;
    },
  },

  User: {
    id: (parent) => parent.id || parent._id?.toString(),
  },
};