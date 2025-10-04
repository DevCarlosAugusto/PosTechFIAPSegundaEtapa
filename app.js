// TODO: Criar Funções 'next' para utilizar o 'CreateError'
// import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { initializeDatabase, createTables } from './src/lib/pg/db.init.js';

import setupSwagger from './src/swagger.js';

import AuthRouter from './src/routes/auth.js';
import HomeRouter from './src/routes/home.js';
import UsersRouter from './src/routes/users.js';
// import PostsRouter from './src/routes/posts.js';
import ErrorController from './src/controllers/error.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
let isDbReady = false; // Estado para controlar se o DB está pronto

app.use((req, res, next) => {
    if (isDbReady) {
        next(); // DB pronto, segue para as rotas
    } else {
        res.status(503).json({
            status: 'error',
            message: 'O servidor está iniciando. O banco de dados está sendo configurado. Tente novamente em alguns segundos.'
        });
    }
});

setupSwagger(app);

app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src/public')));

app.use('/', HomeRouter);
app.use('/auth', AuthRouter);
app.use('/users', UsersRouter);
// app.use('/posts', PostsRouter);

app.use(ErrorController);

async function bootstrapDatabase() {
    try {
        console.log('Iniciando o bootstrap do banco de dados em segundo plano...');

        await initializeDatabase();
        await createTables();

        isDbReady = true;
        console.log('✅ Bootstrap do banco de dados concluído com sucesso. Servidor liberado para requisições.');

    } catch (error) {
        console.error('❌ ERRO CRÍTICO no bootstrap: Falha na inicialização do DB. O servidor permanecerá indisponível.', error);
    }
}

bootstrapDatabase();

export default app;
