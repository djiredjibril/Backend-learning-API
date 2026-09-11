import { createSchema, createYoga } from 'graphql-yoga';
import { createServer } from 'http';

// --- Données factices (en mémoire, pour l'exemple) ---
let users = [
  { id: '1', name: 'Awa', email: 'awa@example.com' },
  { id: '2', name: 'Koffi', email: 'koffi@example.com' },
];

let posts = [
  { id: '101', title: 'Découvrir GraphQL', authorId: '1' },
  { id: '102', title: 'Les bases de gRPC', authorId: '1' },
  { id: '103', title: 'REST vs GraphQL', authorId: '2' },
];

// --- Schéma : on définit les types et les relations ---
const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!        # relation résolue à la demande
  }

  type Post {
    id: ID!
    title: String!
    author: User!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    posts: [Post!]!
  }

  type Mutation {
    addUser(name: String!, email: String!): User!
  }
`;

// --- Resolvers : le code qui va chercher/produit la donnée ---
const resolvers = {
  Query: {
    users: () => users,
    user: (_parent, args) => users.find((u) => u.id === args.id),
    posts: () => posts,
  },
  Mutation: {
    addUser: (_parent, args) => {
      const newUser = { id: String(users.length + 1), ...args };
      users.push(newUser);
      return newUser;
    },
  },
  // Résolveur de champ imbriqué : appelé uniquement si le client demande "posts"
  User: {
    posts: (parent) => posts.filter((p) => p.authorId === parent.id),
  },
  Post: {
    author: (parent) => users.find((u) => u.id === parent.authorId),
  },
};

const yoga = createYoga({ schema: createSchema({ typeDefs, resolvers }) });
const server = createServer(yoga);

server.listen(4000, () => {
  console.log('Serveur GraphQL prêt sur http://localhost:4000/graphql');
});
