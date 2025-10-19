export const typeDefs = `#graphql
  type Query {
    getUsers: [User]
    getUserById(id: ID!): User
    me: User
  }

  type Mutation {
    createUser(
      firstName: String!,
      lastName: String!,
      email: String!,
      password: String!
    ): User!

    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;
