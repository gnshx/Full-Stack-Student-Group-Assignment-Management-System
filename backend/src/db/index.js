const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production' || (process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('render.com') || process.env.DATABASE_URL.includes('neon.tech') || process.env.DATABASE_URL.includes('sslmode=require')));

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      }
    : {
        user: process.env.PGUSER || 'joineasy',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'joineasy_db',
        password: process.env.PGPASSWORD || 'joineasy_secret',
        port: process.env.PGPORT || 5432,
      }
);

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
