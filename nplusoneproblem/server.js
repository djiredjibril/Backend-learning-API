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
    // AVANT (naïf) : une requête SQL par user
    // posts: async (parent) => {
    //   const result = await pool.query('SELECT * FROM posts WHERE author_id = $1', [parent.id]);
    //   return result.rows;
    // },

    // APRÈS (DataLoader) : les appels sont groupés automatiquement
    posts: async (parent, _args, context) => {
      return context.loaders.postsByAuthorId.load(parent.id);
    },
  },

  Post: {
    author: async (parent) => {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [parent.author_id]
      );
      return result.rows[0];
    },
    comments: async (parent) => {
      const result = await pool.query(
        'SELECT * FROM comments WHERE post_id = $1',
        [parent.id]
      );
      return result.rows;
    },
  },

  Comment: {
    author: async (parent) => {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [parent.author_id]
      );
      return result.rows[0];
    },
  },
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  // Le contexte est recréé à CHAQUE requête HTTP entrante -- donc
  // createLoaders() est appelé à chaque fois, garantissant des loaders
  // (et leur cache interne) neufs par requête, jamais partagés entre elles.
  context: () => ({
    loaders: createLoaders(),
  }),
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log('Serveur GraphQL prêt sur http://localhost:4000/graphql');
});
