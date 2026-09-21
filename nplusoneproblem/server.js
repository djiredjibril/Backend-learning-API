import { createSchema, createYoga } from 'graphql-yoga';
import { createServer } from 'http';
import pool from './db.js';

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

// --- Resolvers NAÏFS : une requête SQL séparée par relation, par élément ---
const resolvers = {
  Query: {
    users: async () => {
      const result = await pool.query('SELECT * FROM users');
      return result.rows;
    },
  },

  User: {
    posts: async (parent) => {
      // Appelé une fois PAR USER renvoyé par Query.users -> c'est le piège N+1
      const result = await pool.query(
        'SELECT * FROM posts WHERE author_id = $1',
        [parent.id]
      );
      return result.rows;
    },
  },

  Post: {
    author: async (parent) => {
      // Appelé une fois PAR POST -> encore une requête séparée
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [parent.author_id]
      );
      return result.rows[0];
    },
    comments: async (parent) => {
      // Appelé une fois PAR POST -> encore une requête séparée
      const result = await pool.query(
        'SELECT * FROM comments WHERE post_id = $1',
        [parent.id]
      );
      return result.rows;
    },
  },

  Comment: {
    author: async (parent) => {
      // Appelé une fois PAR COMMENT -> encore une requête séparée
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [parent.author_id]
      );
      return result.rows[0];
    },
  },
};

const yoga = createYoga({ schema: createSchema({ typeDefs, resolvers }) });
const server = createServer(yoga);

server.listen(4000, () => {
  console.log('Serveur GraphQL prêt sur http://localhost:4000/graphql');
});
