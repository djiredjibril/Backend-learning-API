import DataLoader from 'dataloader';
import pool from './db.js';

export function createLoaders() {
  const postsByAuthorId = new DataLoader(async (authorIds) => {
    console.log('Batch postsByAuthorId --', authorIds.length, 'ids:', authorIds);

    const result = await pool.query(
      'SELECT * FROM posts WHERE author_id = ANY($1)',
      [authorIds]
    );

    return authorIds.map((id) =>
      result.rows.filter((post) => post.author_id === id)
    );
  });

  // Partagé par Post.author ET Comment.author -- les deux cherchent
  // un user par id, donc un seul loader suffit pour les deux resolvers.
  const userById = new DataLoader(async (userIds) => {
    console.log('Batch userById --', userIds.length, 'ids:', userIds);

    const result = await pool.query(
      'SELECT * FROM users WHERE id = ANY($1)',
      [userIds]
    );

    // Ici chaque id correspond à EXACTEMENT un user (pas une liste) --
    // on utilise .find() au lieu de .filter(), et undefined si jamais absent.
    return userIds.map((id) =>
      result.rows.find((user) => user.id === id)
    );
  });

  const commentsByPostId = new DataLoader(async (postIds) => {
    console.log('Batch commentsByPostId --', postIds.length, 'ids:', postIds);

    const result = await pool.query(
      'SELECT * FROM comments WHERE post_id = ANY($1)',
      [postIds]
    );

    return postIds.map((id) =>
      result.rows.filter((comment) => comment.post_id === id)
    );
  });

  return { postsByAuthorId, userById, commentsByPostId };
}
