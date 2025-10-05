import { beforeAll, afterAll } from 'vitest';
import { initializeDatabase, AppDataSource } from './src/lib/pg/db.init.js';

import { PostSchema } from './src/entities/post.entity.js';
import { UserSchema } from './src/entities/user.entity.js';

process.env.NODE_ENV = 'test';

beforeAll(async () => {
    console.log('[VITEST] Iniciando conexão com o banco de dados de teste...');
    try {
        await initializeDatabase();
    } catch (error) {
        console.error('[VITEST] Falha ao inicializar o DB no setup:', error.message);
        throw error;
    }

    if (AppDataSource && AppDataSource.isInitialized) {
        await AppDataSource.synchronize(true);
    }
});

afterAll(async () => {
    if (AppDataSource && AppDataSource.isInitialized) {
        console.log('[VITEST] Limpando tabelas...');

        await AppDataSource.manager.clear(PostSchema);
        await AppDataSource.manager.clear(UserSchema);

        console.log('[VITEST] Fechando conexão com o DB de teste.');
        await AppDataSource.destroy();
    }
});
