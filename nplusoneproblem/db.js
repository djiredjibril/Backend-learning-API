import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionTimeoutMillis: 5000,  // abandonne une tentative bloquée après 5s
  max: 10,                          // nombre max de connexions simultanées
});

pool.on('error', (err) => {
  console.error('Erreur inattendue du pool PostgreSQL:', err.message);
});

export default pool;



