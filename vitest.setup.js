import { initializeDatabase, createTables, closeDatabaseConnection } from './src/lib/pg/db.init.js';
import { Client } from 'pg'; // Importe o Client do pg para a criação do DB no setup
import { beforeAll, afterAll } from 'vitest';

// Variáveis de ambiente que devem ser carregadas pelo 'dotenv -e .env.test'
const PG_CONFIG = {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST || 'localhost',
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
};
const TEST_DATABASE_NAME = process.env.POSTGRES_DB + '_test';

// Função para CRIAR o DB de TESTE antes de TUDO
async function createTestDatabase() {
    console.log(`[SETUP] Verificando e criando o banco de testes: ${TEST_DATABASE_NAME}`);

    // Conecta ao banco de dados administrativo 'postgres'
    const client = new Client({
        ...PG_CONFIG,
        database: 'postgres',
    });

    try {
        await client.connect();

        // 1. Força o DROP do banco de dados de TESTE, caso ele já exista
        await client.query(`SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '${TEST_DATABASE_NAME}'
            AND pid <> pg_backend_pid();`);

        await client.query(`DROP DATABASE IF EXISTS "${TEST_DATABASE_NAME}";`);

        // 2. Cria o novo banco de dados de TESTE
        await client.query(`CREATE DATABASE "${TEST_DATABASE_NAME}" WITH OWNER = ${PG_CONFIG.user};`);
        console.log(`[SETUP] Banco de dados de teste criado e pronto.`);
    } catch (error) {
        console.error('[SETUP] Erro CRÍTICO ao criar o banco de testes. Verifique as permissões do usuário:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

// Roda UMA VEZ antes de todos os testes
beforeAll(async () => {
    // 1. Cria o banco de dados do zero no PostgreSQL
    await createTestDatabase();
    // 2. Inicializa o TypeORM (agora o DB existe)
    await initializeDatabase();
    // 3. Cria as tabelas (TypeORM)
    await createTables();
});

// Roda UMA VEZ depois de todos os testes
afterAll(async () => {
    // 1. Fecha a conexão do TypeORM e destrói o DB de teste
    await closeDatabaseConnection();
});