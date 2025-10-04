// TODO: Criar Funções 'next' para utilizar o 'CreateError'
// import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import setupSwagger from './src/swagger.js';

import AuthRouter from './src/routes/auth.js';
import HomeRouter from './src/routes/home.js';
import UsersRouter from './src/routes/users.js';
import PostsRouter from './src/routes/posts.js';
import ErrorController from './src/controllers/error.controller.js';

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

app.use('/', HomeRouter);
app.use('/auth', AuthRouter);
app.use('/users', UsersRouter);
app.use('/posts', PostsRouter);

// Middlewares / controllers de erro específicos
app.use(ErrorController);

// handler de erro final precisa do `next`
app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

export default app;