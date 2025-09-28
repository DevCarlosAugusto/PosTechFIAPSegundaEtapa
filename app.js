// TODO: Criar Funções 'next' para utilizar o 'CreateError'
// import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import setupSwagger from './src/controllers/swagger.js';

import indexRouter from './src/routes/index.js';
import usersRouter from './src/routes/users.js';
import postsRouter from './src/routes/posts.js';
import ErrorController from './src/controllers/ErrorController.js';

// importe o setup do DB
import { setupDatabase } from './database/database.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

setupSwagger(app);

app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src/public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

// rota para preparar o banco (idempotente)
app.get('/setup-db', setupDatabase);

// Middlewares / controllers de erro específicos
app.use(ErrorController);

// handler de erro final precisa do `next`
app.use((err, req, res, _next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

export default app;