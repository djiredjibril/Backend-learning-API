import pg from 'pg';

const pool = new pg.Pool({
  user: 'john',
  password: 'jedoispasser',
  host: 'localhost',
  database: 'n_problem_db',
  port: 5432,
});

export default pool;
