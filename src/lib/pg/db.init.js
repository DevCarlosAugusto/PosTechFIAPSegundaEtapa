import { Client } from 'pg';

const config = {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
    user: process.env.POSTGRES_USER || 'postgres',
    password: '123456',
    databaseName: process.env.POSTGRES_DB,
};

async function initializeDatabase() {
    const tempConfig = {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: 'postgres'
    };

    const client = new Client(tempConfig);

    try {
        console.log(`[DB Init] Tentando conectar ao PostgreSQL em ${config.host}:${config.port}...`);
        await client.connect();
        console.log('[DB Init] Conexão temporária ao PostgreSQL estabelecida com sucesso.');

        const dbCheckQuery = 'SELECT 1 FROM pg_database WHERE datname = $1';
        const result = await client.query(dbCheckQuery, [config.databaseName]);

        if (result.rowCount === 0) {
            console.log(`[DB Init] Banco de dados '${config.databaseName}' não encontrado. Criando...`);
            await client.query(`CREATE DATABASE ${config.databaseName}`);
            console.log(`[DB Init] Banco de dados '${config.databaseName}' criado com sucesso.`);
        } else {
            console.log(`[DB Init] Banco de dados '${config.databaseName}' já existe. Prosseguindo...`);
        }

    } catch (error) {
        console.error('[DB Init] ERRO FATAL ao inicializar/conectar o banco de dados:', error.message);
    } finally {
        if (client) {
            await client.end();
            console.log('[DB Init] Conexão temporária ao PostgreSQL encerrada.');
        }
    }
}

async function createTables() {
    console.log('[DB Init] Função createTables (futura) chamada.');
}

export {
    initializeDatabase,
    createTables,
    config
};
