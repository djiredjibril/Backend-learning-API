import DataLoader from 'dataloader';
import pool from './db.js';

// Un loader "par requête HTTP" -- cette fonction sera appelée à chaque
// nouvelle requête GraphQL entrante, jamais réutilisée entre deux requêtes
// différentes (sinon risque de fuite de cache entre utilisateurs).
export function createLoaders() {
  const postsByAuthorId = new DataLoader(async (authorIds) => {
    console.log('DataLoader batch -- author_ids demandés:', authorIds);

    const result = await pool.query(
      'SELECT * FROM posts WHERE author_id = ANY($1)',
      [authorIds]
    );

    // DataLoader exige qu'on renvoie un tableau dans LE MÊME ORDRE
    // que les clés reçues -- un groupBy + remise en ordre est nécessaire.
    return authorIds.map((id) =>
      result.rows.filter((post) => post.author_id === id)
    );
  });

  return { postsByAuthorId };
}
