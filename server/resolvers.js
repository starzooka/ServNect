import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt'; // <-- 1. Import bcrypt

export const resolvers = {
  Query: {
    // This resolver must be async since it's waiting for the database
    getUsers: async (parent, args, context) => {
      // Get the db from the context
      const { db } = context;
      // Fetch all documents from the 'users' collection
      return await db.collection('users').find().toArray();
    },

    // Get a single user by their ID
    getUserById: async (parent, args, context) => {
      const { db } = context;
      // MongoDB queries by '_id', and it must be an ObjectId
      return await db.collection('users').findOne({ _id: new ObjectId(args.id) });
    },
  },

  Mutation: {
    createUser: async (parent, args, context) => {
      const { db } = context;
      const { name, email, password } = args;

      // --- 2. Hash the password ---
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      // ----------------------------

      // 3. Insert the new user with the hashed password
      const result = await db.collection('users').insertOne({ 
        name, 
        email, 
        password: hashedPassword // <-- Save the hash
      });

      // The database returns a result object with the insertedId.
      // We return the full user object to match the schema.
      return {
        _id: result.insertedId, // <-- Pass the original ObjectId
        name: args.name,
        email: args.email,
        password: hashedPassword // <-- Return the hash
      };
    },
  },
  
  // This special resolver handles the _id -> id conversion
  User: {
    id: (parent) => {
      // 'parent' is the user document from the database.
      // This function takes the '_id' from the database and returns it as a string for the 'id' field.
      return parent._id.toString();
    }
  }
};