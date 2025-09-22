const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const db = require("./db"); 

function getPgConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: /^true$/i.test(process.env.SSL || "false")
        ? { rejectUnauthorized: false }
        : false,
    };
  }

  const {
    PGHOST,
    PGPORT,
    PGUSER,
    PGPASSWORD,
    PGDATABASE,
  } = process.env;

  const {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
  } = process.env;

  const host = PGHOST || POSTGRES_HOST || "localhost";
  const port = Number(PGPORT || POSTGRES_PORT || 5432);
  const user = PGUSER || POSTGRES_USER || "postgres";
  const password = String(
    (PGPASSWORD ?? POSTGRES_PASSWORD ?? "")
  ); 
  const database = PGDATABASE || POSTGRES_DB || "educablog";
  const ssl =
    /^true$/i.test(process.env.SSL || "false")
      ? { rejectUnauthorized: false }
      : false;

  return { host, port, user, password, database, ssl };
}



async function ensureDatabaseExists(dbName) {
  const baseCfg = getPgConfig();

  const adminCfg = {
    ...baseCfg,
    database: "postgres",
  };
  const adminPool = new Pool(adminCfg);

  try {
    const { rows } = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (rows.length === 0) {
      console.log(`Banco \"${dbName}\" não existe; criando...`);
      await adminPool.query(`CREATE DATABASE ${JSON.stringify(dbName).replaceAll('"', '')}`);
      console.log(`Banco \"${dbName}\" criado.`);
    } else {
      console.log(`Banco \"${dbName}\" já existe; seguindo...`);
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

    // pula qualquer linha de metacomando do psql
    if (t.startsWith("\\connect") || t.startsWith("\\")) continue;

    // se encontrar o bloco condicional de criação de DB, pula ele todo
    if (/^SELECT\s+'CREATE DATABASE/i.test(t)) {
      skipCreateDbBlock = true;
      continue;
    }
    if (skipCreateDbBlock) {
      if (t.includes("\\gexec")) {
        skipCreateDbBlock = false; // acabou o bloco
      }
      continue; // pula enquanto o bloco não terminar
    }

    // mantém as outras linhas
    out.push(ln);
  }

  return out.join("\n");
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

    
    if (!inSingleQuote && next2 === "$$") {
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

   
    if (!inSingleQuote && !inDollar && next2 === "--") {
      
      const nl = sqlText.indexOf("\n", i + 2);
      if (nl === -1) break; 
      i = nl + 1;
      continue;
    }

    if (!inSingleQuote && !inDollar && ch === ";") {
      const stmt = current.join("").trim();
      if (stmt) statements.push(stmt);
      current = [];
      i += 1;
      continue;
    }

    current.push(ch);
    i += 1;
  }

  const last = current.join("").trim();
  if (last) statements.push(last);
  return statements;
}


async function runSqlFileIdempotent(scriptPath, targetDbName = "educablog") {
  await ensureDatabaseExists(targetDbName);

  
// 2) Lê e prepara o script
const rawSql = fs.readFileSync(scriptPath, "utf8");

// remove BOM do início (caractere invisível \uFEFF)
const noBOM = rawSql.replace(/^\uFEFF/, "");

// remove linhas do psql (\gexec, \connect) e bloco condicional de CREATE DATABASE
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

// Controller HTTP
exports.setupDatabase = async (req, res) => {
  try {
    const scriptPath = path.join(__dirname, "educablog.sql");
    await runSqlFileIdempotent(scriptPath, process.env.PGDATABASE || "educablog");
    res.status(200).send('Banco de dados "educablog" configurado com sucesso (idempotente).');
  } catch (error) {
    console.error("Erro ao executar o script SQL:", error);
    res.status(500).send("Erro ao configurar o banco de dados: " + error.message);
  }
};
