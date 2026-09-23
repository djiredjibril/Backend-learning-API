import { createSchema, createYoga } from 'graphql-yoga';
import { createServer } from 'http';
import pool from './db.js';
import { createLoaders } from './loaders.js';

const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    body: String!
    author: User!
  }

  type Query {
    users: [User!]!
  }
`;

const resolvers = {
  Query: {
    users: async () => {
      const result = await pool.query('SELECT * FROM users');
      return result.rows;
    },
  },

  User: {
    posts: async (parent, _args, context) => {
      return context.loaders.postsByAuthorId.load(parent.id);
    },
  },

  Post: {
    author: async (parent, _args, context) => {
      return context.loaders.userById.load(parent.author_id);
    },
    comments: async (parent, _args, context) => {
      return context.loaders.commentsByPostId.load(parent.id);
    },
  },

  Comment: {
    author: async (parent, _args, context) => {
      return context.loaders.userById.load(parent.author_id);
    },
  },
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  context: () => ({
    loaders: createLoaders(),
  }),
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log('Serveur GraphQL prêt sur http://localhost:4000/graphql');
});
