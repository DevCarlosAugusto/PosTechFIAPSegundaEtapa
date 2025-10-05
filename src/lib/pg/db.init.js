import { DataSource } from 'typeorm';
import { Client } from 'pg'; // <-- NOVO: Importe o Client do pg para a destruição
import dotenv from 'dotenv';

import { UserSchema } from '../../entities/user.entity.js';
import { PostSchema } from '../../entities/post.entity.js';

dotenv.config();

const DATABASE_NAME = process.env.NODE_ENV === 'test' ? process.env.POSTGRES_DB + '_test' : process.env.POSTGRES_DB;
export let AppDataSource = null;

const PG_CONFIG = {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST || 'localhost',
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
};

const dataSourceOptions = {
    type: 'postgres',
    host: PG_CONFIG.host,
    port: PG_CONFIG.port,
    username: PG_CONFIG.user,
    password: PG_CONFIG.password,
    database: DATABASE_NAME,
    synchronize: true,
    logging: process.env.ENVIRONMENT === 'development' ? ['query', 'error'] : ['error'],
    entities: [
        UserSchema,
        PostSchema,
    ],
};

export async function initializeDatabase() {
    if (!DATABASE_NAME || DATABASE_NAME.endsWith('_test') && !process.env.POSTGRES_DB) {
        console.error("[DB INIT] ERRO: A variável de ambiente POSTGRES_DB não está definida.");
        throw new Error("DATABASE_NAME não configurado. Verifique seus arquivos .env.");
    }

    if (AppDataSource && AppDataSource.isInitialized) {
        console.log("TypeORM AppDataSource já está pronto.");
        return;
    }

    AppDataSource = new DataSource(dataSourceOptions);
    await AppDataSource.initialize();
    console.log("TypeORM AppDataSource inicializado.");
}

export async function createTables() {
    if (!AppDataSource || !AppDataSource.isInitialized) {
        throw new Error('TypeORM AppDataSource não está pronto.');
    }

    console.log('[DB INIT] Criação de tabelas (sincronização de Entities) concluída pelo TypeORM.');
}

// ---------------------------------------------------------------------
// --- NOVO: FUNÇÃO PARA FECHAR CONEXÃO E DESTRUIR O DB DE TESTE ---
// ---------------------------------------------------------------------
export async function closeDatabaseConnection() {
    // 1. Encerra a conexão do TypeORM, se estiver ativa
    if (AppDataSource && AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.log("TypeORM DataSource encerrado.");
    }

    // 2. Destruição do banco de dados de teste (Apenas se for um DB de teste)
    // O teste só destrói se o nome do banco terminar em '_test'
    if (DATABASE_NAME && DATABASE_NAME.endsWith('_test')) {
        console.log(`[TEST DB] Tentando destruir o banco de testes: ${DATABASE_NAME}`);

        // Conecta ao DB administrativo 'postgres'
        const client = new Client({
            ...PG_CONFIG,
            database: 'postgres', // Conecta ao DB padrão para gerenciar outros DBs
        });

        try {
            await client.connect();

            // Força a desconexão de todos os usuários restantes
            await client.query(`SELECT pg_terminate_backend(pg_stat_activity.pid)
                                FROM pg_stat_activity
                                WHERE pg_stat_activity.datname = '${DATABASE_NAME}'
                                  AND pid <> pg_backend_pid();`);

            // DROP DATABASE IF EXISTS
            await client.query(`DROP DATABASE IF EXISTS "${DATABASE_NAME}";`);
            console.log(`[TEST DB] Banco de dados "${DATABASE_NAME}" destruído após os testes.`);
        } catch (error) {
            // Este erro é comum se o usuário não tem permissão para DROP DATABASE
            console.error('[TEST DB] Erro ao destruir o banco de testes no final:', error.message);
            console.warn('[TEST DB] O banco de dados de teste pode ter permanecido. Verifique as permissões do usuário PostgreSQL.');
        } finally {
            await client.end();
        }
    }
}
