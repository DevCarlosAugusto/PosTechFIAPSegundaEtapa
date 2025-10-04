import PostRepository, { PostCreationSchema, PostUpdateSchema } from '../models/post.model.js';
import createError from 'http-errors';

/**
 * @typedef {import('express').RequestHandler} RequestHandler
 */

const formatZodErrors = (error) => {
    return error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
    }));
};

/**
 * @description Lida com a criação de um novo post. (POST /posts)
 * @type {RequestHandler}
 */
export const createPost = async (req, res, next) => {
    try {
        const created_by_id = req.user.id;
        const postData = PostCreationSchema.parse({ ...req.body, created_by_id });
        const newPost = await PostRepository.create(postData);

        res.status(201).json({
            message: 'Post criado com sucesso!',
            post: newPost,
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            return next(createError(400, 'Dados de entrada inválidos.', { details: formatZodErrors(error) }));
        }

        console.error("Erro ao criar post:", error.message);
        next(createError(500, 'Falha interna ao criar o post.'));
    }
};

/**
 * @description Lida com a listagem de todos os posts. (GET /posts)
 * @type {RequestHandler}
 */
export const getAllPosts = async (req, res, next) => {
    try {
        const posts = await PostRepository.findAll();
        res.json(posts);
    } catch (error) {
        console.error("Erro ao listar posts:", error.message);
        next(createError(500, 'Falha interna ao buscar posts.'));
    }
};

/**
 * @description Lida com a busca de um post pelo ID. (GET /posts/:id)
 * @type {RequestHandler}
 */
export const getPostById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return next(createError(400, 'ID de post inválido.'));

        const post = await PostRepository.findById(id);

        if (!post) {
            return next(createError(404, 'Post não encontrado.'));
        }

        res.json(post);
    } catch (error) {
        console.error("Erro ao buscar post por ID:", error.message);
        next(createError(500, 'Falha interna ao buscar o post.'));
    }
};

/**
 * @description Lida com a atualização de um post pelo ID. (PUT /posts/:id)
 * @type {RequestHandler}
 */
export const updatePost = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) return next(createError(400, 'ID de post inválido.'));

        const edited_by_id = req.user.id;
        const validatedUpdateData = PostUpdateSchema.parse(req.body);
        const updateData = { ...validatedUpdateData, edited_by_id };
        const updatedPost = await PostRepository.update(id, updateData);

        if (!updatedPost) {
            return next(createError(404, 'Post não encontrado para atualização.'));
        }

        res.json({ message: 'Post atualizado com sucesso.', post: updatedPost });

    } catch (error) {
        if (error.name === 'ZodError') {
            return next(createError(400, 'Dados de entrada inválidos.', { details: formatZodErrors(error) }));
        }

        console.error("Erro ao atualizar post:", error.message);
        next(createError(500, 'Falha interna ao atualizar o post.'));
    }
};

/**
 * @description Lida com a remoção de um post pelo ID. (DELETE /posts/:id)
 * @type {RequestHandler}
 */
export const deletePost = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return next(createError(400, 'ID de post inválido.'));

        const wasRemoved = await PostRepository.remove(id);

        if (!wasRemoved) {
            return next(createError(404, 'Post não encontrado para exclusão.'));
        }

        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar post:", error.message);
        next(createError(500, 'Falha interna ao deletar o post.'));
    }
};

/**
 * @description Lida com a busca de posts por palavra-chave. (GET /posts/search?termo=...)
 * @type {RequestHandler}
 */
export const searchPosts = async (req, res, next) => {
    try {
        const termo = req.query.termo;

        if (!termo || typeof termo !== 'string' || termo.trim() === '') {
            return next(createError(400, 'O parâmetro de busca "termo" é obrigatório.'));
        }

        const resultados = await PostRepository.search(termo);

        res.json(resultados);
    } catch (error) {
        console.error("Erro ao buscar posts:", error.message);
        next(createError(500, 'Falha interna ao buscar posts.'));
    }
};

export default {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
};