import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

function getPgConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: needSSL(),
    };
  }

  // Lê as variáveis no padrão definido no .env do grupo
  const {
    POSTGRES_HOST = "localhost",
    POSTGRES_PORT = 5432,
    POSTGRES_USER = "postgres",
    POSTGRES_PASSWORD = "",
    POSTGRES_DB = "educablog",
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

function needSSL() {
  const flag = String(process.env.SSL || "").toLowerCase() === "true";
  if (flag) return { rejectUnauthorized: false };
  if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
    return { rejectUnauthorized: false };
  }
  return false;
}

const pool = new Pool(getPgConfig());

pool.on("error", (err) => {
  console.error("Erro inesperado no pool do Postgres:", err);
});

export const query = (text, params) => pool.query(text, params);
export default pool;