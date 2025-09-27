// database/db.js  (ESM)
import 'dotenv/config';
import { Pool } from 'pg';

function needSSL() {
  const flag = String(process.env.SSL || '').toLowerCase() === 'true';
  if (flag) return { rejectUnauthorized: false };
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    return { rejectUnauthorized: false };
  }
  return false;
}

function getPgConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL, ssl: needSSL() };
  }

  const {
    POSTGRES_HOST = 'localhost',
    POSTGRES_PORT = 5432,
    POSTGRES_USER = 'postgres',
    POSTGRES_PASSWORD = '',
    POSTGRES_DB = 'educablog',
  } = process.env;

  return {
    host: POSTGRES_HOST,
    port: Number(POSTGRES_PORT),
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    ssl: needSSL(),
  };
}

export const pool = new Pool(getPgConfig());
pool.on('error', (err) => console.error('Erro inesperado no pool do Postgres:', err));

export const query = (text, params) => pool.query(text, params);

// opcional, mas útil se alguém importar como default
export default { pool, query };
