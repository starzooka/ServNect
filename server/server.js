import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import dotenv from "dotenv";
dotenv.config();


const users = [
    { id: "1", name: "Alice", email: "alice@example.com", password: "password123" },
    { id: "2", name: "Bob", email: "bob@example.com", password: "password456" },
    { id: "3", name: "Charlie", email: "charlie@example.com", password: "password789" },
    { id: "4", name: "David", email: "david@example.com", password: "password101" }
];
const typeDefs = `
    type Query {
    getUsers: [User]
    getUserById(id: ID!): User
}
    type Mutation {
    createUser(name: String!, email: String!, password: String!): User!
}

type User{
    id: ID!
    name: String!
    email: String!
    password: String!
}
`;

const resolvers = {
  Query: {
    getUsers: () => {
        return users
    },
    getUserById: (parent, args) => {
        return users.find(user => user.id === args.id)
    },
  },
  Mutation: {
    createUser: (parent, args) => {
        const {name, email, password} = args;
        const newUser = {
            id: `${users.length + 1}`,
            name,
            email,
            password
        };
        users.push(newUser);
        return newUser;
    },
  },
};


const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: process.env.PORT || 4000 },
});

console.log(`🚀  Server ready at: ${url}`);