// Export the type definitions
export const typeDefs = `#graphql
    type Query {
        getUsers: [User]
        getUserById(id: ID!): User
    }
    type Mutation {
        createUser(name: String!, email: String!, password: String!): User!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        password: String!
    }
`;