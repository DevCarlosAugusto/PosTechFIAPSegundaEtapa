import { DataSource } from 'typeorm';
import { UserEntity } from '../../entities/user.entity.js';
import { PostEntity } from '../../entities/post.entity.js';
import pg from 'pg';

const DATABASE_NAME = process.env.POSTGRES_DB;

export let AppDataSource = null;

const PG_CONFIG = {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST || 'localhost',
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_HOST || '5432', 10),
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
        UserEntity,
        PostEntity,
    ],
};

export async function initializeDatabase() {
    if (!DATABASE_NAME) {
        console.error("[DB INIT] ERRO: A variável de ambiente PG_DB_NAME não está definida.");
        throw new Error("DATABASE_NAME não configurado. Verifique seus arquivos .env.");
    }

    let client;
    try {
        console.log(`[DB INIT] Tentando conectar ao PostgreSQL em ${PG_CONFIG.host}:${PG_CONFIG.port} para verificar o DB...`);

        client = new pg.Client({ ...PG_CONFIG, database: 'postgres' });
        await client.connect();

        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DATABASE_NAME]);

        if (res.rowCount === 0) {
            console.log(`[DB INIT] Banco de dados '${DATABASE_NAME}' não encontrado. Criando...`);
            await client.query(`CREATE DATABASE ${DATABASE_NAME}`);
            console.log(`[DB INIT] Banco de dados '${DATABASE_NAME}' criado com sucesso.`);
        } else {
            console.log(`[DB INIT] Banco de dados '${DATABASE_NAME}' já existe.`);
        }

    } catch (error) {
        console.error(`[DB INIT] ERRO FATAL na fase de verificação/criação do banco de dados: ${error.message}`);
        throw error;
    } finally {
        if (client) {
            await client.end();
            console.log('[DB INIT] Conexão temporária ao PostgreSQL encerrada.');
        }
    }

    try {
        AppDataSource = new DataSource(dataSourceOptions);
        await AppDataSource.initialize();
        console.log(`[DB INIT] TypeORM DataSource inicializado com sucesso para '${DATABASE_NAME}'.`);
    } catch (error) {
        console.error(`[DB INIT] ERRO FATAL ao inicializar o TypeORM DataSource: ${error.message}`);
        throw error;
    }
}

export async function createTables() {
    if (!AppDataSource || !AppDataSource.isInitialized) {
        console.error('[DB INIT] ERRO: TypeORM AppDataSource não está pronto. Não é possível criar tabelas.');
        throw new Error('TypeORM AppDataSource não está pronto.');
    }

    console.log('[DB INIT] Criação de tabelas (sincronização de Entities) concluída pelo TypeORM.');
}
