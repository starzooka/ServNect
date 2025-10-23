import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql"; // Import this for better errors

const isProduction = process.env.NODE_ENV === "production";

export const resolvers = {
  Query: {
    // ... (your existing queries)
    getUsers: async (parent, args, { db }) => {
      const users = await db.collection("users").find().toArray();
      return users.map(({ _id, password, ...rest }) => ({
        id: _id.toString(),
        ...rest,
      }));
    },
    getUserById: async (parent, { id }, { db }) => {
      // ...
    },
    me: async (parent, args, { user }) => {
      if (!user) return null;
      return user;
    },
  },

  Mutation: {
    // ✅ FIX: Added the full implementation for createUser
    createUser: async (
      parent,
      { firstName, lastName, email, password }, // Destructure args
      { db, res, JWT_SECRET } // Destructure context
    ) => {
      try {
        // 1. Check if user already exists
        const existingUser = await db.collection("users").findOne({ email });
        if (existingUser) {
          throw new GraphQLError("User already exists", {
            extensions: { code: "BAD_REQUEST" },
          });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 3. Create and insert new user
        const newUser = {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          createdAt: new Date(),
        };

        const result = await db.collection("users").insertOne(newUser);
        const insertedId = result.insertedId;

        // 4. Create token and set cookie (like in login)
        const token = jwt.sign({ userId: insertedId }, JWT_SECRET, {
          expiresIn: "7d",
        });

        res.cookie("token", token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        // 5. Return the new user object (must match schema)
        // Your SignUp.jsx mutation was returning the user, not the LoginPayload
        // This returns the user part, which your frontend seems to expect.
        return {
          id: insertedId.toString(),
          firstName,
          lastName,
          email,
        };
      } catch (err) {
        console.error("createUser error:", err);
        throw new GraphQLError(err.message || "Could not create user.", {
          extensions: {
            code: err.extensions?.code || "INTERNAL_SERVER_ERROR",
          },
        });
      }
    },

    login: async (parent, { email, password }, { db, res, JWT_SECRET }) => {
      try {
        const user = await db.collection("users").findOne({ email });
        if (!user) throw new Error("Invalid email or password");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Invalid email or password");

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        });

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