import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-key";

export const resolvers = {
  Query: {
    getUsers: async (parent, args, { db }) => {
      const users = await db.collection("users").find().toArray();
      return users.map(({ _id, password, ...rest }) => ({
        id: _id.toString(),
        ...rest,
      }));
    },

    // This block is now updated
    getUserById: async (parent, { id }, { db }) => {
      const user = await db.collection("users").findOne({
        _id: ObjectId.createFromHexString(id), // <-- THE FIX
      });
      if (!user) return null;
      const { password, ...rest } = user;
      return { id: user._id.toString(), ...rest };
    },

    me: async (parent, args, { user }) => {
      if (!user) return null;
      return user;
    },
  },

  Mutation: {
    createUser: async (parent, args, { db }) => {
      const { firstName, lastName, email, password } = args;
      const existingUser = await db.collection("users").findOne({ email });
      if (existingUser) throw new Error("Email already in use");

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.collection("users").insertOne({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      return {
        id: result.insertedId.toString(),
        firstName,
        lastName,
        email,
      };
    },

    login: async (parent, { email, password }, { db, res }) => {
      try {
        const user = await db.collection("users").findOne({ email });
        if (!user) throw new Error("Invalid email or password");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Invalid email or password");

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        });

        // ✅ Send token as httpOnly cookie
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
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
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
      });
      return true;
    },
  },

  User: {
    id: (parent) => parent.id || parent._id?.toString(),
  },
};