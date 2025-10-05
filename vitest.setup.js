import { initializeDatabase, createTables, closeDatabaseConnection } from './src/lib/pg/db.init.js';
import { Client } from 'pg';
import { beforeAll, afterAll } from 'vitest';

const PG_CONFIG = {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST || 'localhost',
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
};
const TEST_DATABASE_NAME = process.env.POSTGRES_DB + '_test';

async function createTestDatabase() {
    console.log(`[SETUP] Verificando e criando o banco de testes: ${TEST_DATABASE_NAME}`);

    const client = new Client({
        ...PG_CONFIG,
        database: 'postgres',
    });

    try {
        await client.connect();

        await client.query(`SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '${TEST_DATABASE_NAME}'
            AND pid <> pg_backend_pid();`);

        await client.query(`DROP DATABASE IF EXISTS "${TEST_DATABASE_NAME}";`);

        await client.query(`CREATE DATABASE "${TEST_DATABASE_NAME}" WITH OWNER = ${PG_CONFIG.user};`);
        console.log(`[SETUP] Banco de dados de teste criado e pronto.`);
    } catch (error) {
        console.error('[SETUP] Erro CRÍTICO ao criar o banco de testes. Verifique as permissões do usuário:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

beforeAll(async () => {
    await createTestDatabase();
    await initializeDatabase();
    await createTables();
});

afterAll(async () => {
    await closeDatabaseConnection();
});
