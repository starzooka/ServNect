import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import dotenv from 'dotenv';

// Import your GraphQL logic
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js'; 

// Import your database connection
import { db } from './db.js';

dotenv.config();

const server = new ApolloServer({ 
  typeDefs, 
  resolvers 
});

const { url } = await startStandaloneServer(server, {
  listen: { port: process.env.PORT || 4000 },
  context: async () => {
    return {
      db, // Pass the db connection to your resolvers
    };
  },
});

console.log(`🚀  Server ready at: ${url}`);