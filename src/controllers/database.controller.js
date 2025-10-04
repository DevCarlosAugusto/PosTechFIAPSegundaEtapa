// database/database.controller.js (ESM)
import fs from 'fs';
import path, { dirname } from 'path';
import { Pool } from 'pg';
import * as db from '../../database/db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getPgConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: /^true$/i.test(process.env.SSL || 'false')
        ? { rejectUnauthorized: false }
        : false,
    };
  }

  const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;
  const {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
  } = process.env;

  const host = PGHOST || POSTGRES_HOST || 'localhost';
  const port = Number(PGPORT || POSTGRES_PORT || 5432);
  const user = PGUSER || POSTGRES_USER || 'postgres';
  const password = String(PGPASSWORD ?? POSTGRES_PASSWORD ?? '');
  const database = PGDATABASE || POSTGRES_DB || 'educablog';
  const ssl = /^true$/i.test(process.env.SSL || 'false')
    ? { rejectUnauthorized: false }
    : false;

  return { host, port, user, password, database, ssl };
}

async function ensureDatabaseExists(dbName) {
  const baseCfg = getPgConfig();

  const adminCfg = {
    ...baseCfg,            
    database: 'postgres',
  };
  const adminPool = new Pool(adminCfg);

  try {
    const { rows } = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (rows.length === 0) {
      console.log(`Banco "${dbName}" não existe; criando...`);
      await adminPool.query(
        `CREATE DATABASE ${JSON.stringify(dbName).replaceAll('"', '')}`
      );
      console.log(`Banco "${dbName}" criado.`);
    } else {
      console.log(`Banco "${dbName}" já existe; seguindo...`);
    }
  } finally {
    await adminPool.end();
  }
}

function stripPsqlMetaCommands(sqlText) {
  const lines = sqlText.split(/\r?\n/);
  const out = [];

  let skipCreateDbBlock = false;

  for (let ln of lines) {
    const t = ln.trim();

    if (t.startsWith('\\connect') || t.startsWith('\\')) continue;

    if (/^SELECT\s+'CREATE DATABASE/i.test(t)) {
      skipCreateDbBlock = true;
      continue;
    }
    if (skipCreateDbBlock) {
      if (t.includes('\\gexec')) {
        skipCreateDbBlock = false;
      }
      continue;
    }

    out.push(ln);
  }

  return out.join('\n');
}

function splitSqlStatements(sqlText) {
  const statements = [];
  let current = [];
  let inSingleQuote = false;
  let inDollar = false;
  let i = 0;

  while (i < sqlText.length) {
    const ch = sqlText[i];
    const next2 = sqlText.slice(i, i + 2);

    if (!inSingleQuote && next2 === '$$') {
      inDollar = !inDollar;
      current.push(next2);
      i += 2;
      continue;
    }

    if (!inDollar && ch === "'") {
      inSingleQuote = !inSingleQuote;
      current.push(ch);
      i += 1;
      continue;
    }

    if (!inSingleQuote && !inDollar && next2 === '--') {
      const nl = sqlText.indexOf('\n', i + 2);
      if (nl === -1) break;
      i = nl + 1;
      continue;
    }

    if (!inSingleQuote && !inDollar && ch === ';') {
      const stmt = current.join('').trim();
      if (stmt) statements.push(stmt);
      current = [];
      i += 1;
      continue;
    }

    current.push(ch);
    i += 1;
  }

  const last = current.join('').trim();
  if (last) statements.push(last);
  return statements;
}

async function runSqlFileIdempotent(scriptPath, targetDbName = 'educablog') {
  await ensureDatabaseExists(targetDbName);

  const rawSql = fs.readFileSync(scriptPath, 'utf8');
  const noBOM = rawSql.replace(/^\uFEFF/, '');
  const cleaned = stripPsqlMetaCommands(noBOM);
  const statements = splitSqlStatements(cleaned);

  console.log(`Encontradas ${statements.length} statements para executar.`);

  for (const [idx, sql] of statements.entries()) {
    try {
      await db.query(sql);
      console.log(`OK (${idx + 1}/${statements.length})`);
    } catch (err) {
      console.error(`Falha na statement ${idx + 1}:`, err.message);
      throw err;
    }
  }
}

// Códigos/classificações de erro do Postgres que indicam ausência de DB/tabela/esquema
export const DB_ERROR_CODES_INIT = new Set([
  '3D000', // invalid_catalog_name (DB não existe)
  '42P01', // undefined_table
  '3F000', // invalid_schema_name
  '08001', // sqlclient_unable_to_establish_sqlconnection
  '08006', // connection_failure
  '28P01', // invalid_password 
]);

export function isInitError(err) {
  if (!err) return false;
  if (err.code && DB_ERROR_CODES_INIT.has(err.code)) return true;
  const msg = String(err.message || '').toLowerCase();
  return (
    msg.includes('does not exist') ||      
    msg.includes('undefined table') ||
    msg.includes('invalid catalog name') ||
    msg.includes('invalid schema name')
  );
}


export async function ensureSchema(targetDbName = process.env.PGDATABASE || 'educablog') {
  const scriptPath = path.join(__dirname, 'educablog.sql');
  await runSqlFileIdempotent(scriptPath, targetDbName);
}




export async function setupDatabase(req, res) {
  try {
    const scriptPath = path.join(__dirname, 'educablog.sql');
    await runSqlFileIdempotent(
      scriptPath,
      process.env.PGDATABASE || 'educablog'
    );
    res
      .status(200)
      .send('Banco de dados "educablog" configurado com sucesso (idempotente).');
  } catch (error) {
    console.error('Erro ao executar o script SQL:', error);
    res.status(500).send('Erro ao configurar o banco de dados: ' + error.message);
  }
}