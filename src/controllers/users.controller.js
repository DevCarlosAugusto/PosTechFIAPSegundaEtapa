import UserRepository, { UserCreationSchema } from '../models/user.model.js';
import createError from 'http-errors';

/**
 * @typedef {import('express').RequestHandler} RequestHandler
 */

/**
 * Lida com o registro (Criação) de um novo usuário. (POST /users/register)
 * @type {RequestHandler}
 */
export const registerUser = async (req, res, next) => {
    try {
        const userData = UserCreationSchema.parse(req.body);

        // 2. Verificação de Usuário Existente
        const existingUser = await UserRepository.findByEmail(userData.email);
        if (existingUser) {
            return next(createError(409, 'O email fornecido já está em uso.'));
        }

        // 3. Criação do Usuário (inclui hashing da senha no Model)
        const newUser = await UserRepository.create(userData);

        // Remove o hash da senha antes de enviar a resposta
        const userResponse = {
            id: newUser.id,
            nome: newUser.nome,
            email: newUser.email,
            user_type: newUser.user_type,
            serie: newUser.serie,
            subject: newUser.subject
        };

        // 4. Resposta de Sucesso (201 Created)
        res.status(201).json({
            message: 'Usuário registrado com sucesso!',
            user: userResponse,
        });

    } catch (error) {
        // Lida com erros de validação do Zod
        if (error.name === 'ZodError') {
            const formattedErrors = error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
            }));
            return next(createError(400, 'Dados de entrada inválidos.', { errors: formattedErrors }));
        }

        console.error("Erro no registro do usuário:", error.message);
        next(createError(500, 'Falha interna ao registrar o usuário.'));
    }
};

/**
 * Lida com a listagem de todos os usuários. (GET /users)
 * @type {RequestHandler}
 */
export const listAllUsers = async (req, res, next) => {
    try {
        const users = await UserRepository.findAll();
        // Mapeia para remover o password_hash de todos os usuários
        const usersResponse = users.map(user => {
            const { /*password_hash, */...userPublic } = user;
            return userPublic;
        });
        res.json(usersResponse);
    } catch (error) {
        console.error("Erro ao listar usuários:", error.message);
        next(createError(500, 'Falha interna ao listar usuários.'));
    }
};

/**
 * Lida com a busca de um usuário pelo ID. (GET /users/:id)
 * @type {RequestHandler}
 */
export const getUserById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return next(createError(400, 'ID de usuário inválido.'));

        const user = await UserRepository.findById(id);

        if (!user) {
            return next(createError(404, 'Usuário não encontrado.'));
        }

        // Remove o hash da senha antes de enviar
        const { /*password_hash, */...userResponse } = user;
        res.json(userResponse);
    } catch (error) {
        console.error("Erro ao buscar usuário por ID:", error.message);
        next(createError(500, 'Falha interna ao buscar usuário.'));
    }
};

/**
 * Lida com a atualização de um usuário pelo ID. (PUT /users/:id)
 * Implementação simplificada: requer validação Zod adicional para updates se necessário.
 * @type {RequestHandler}
 */
export const updateUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return next(createError(400, 'ID de usuário inválido.'));

        // Validação básica para os campos que podem ser atualizados
        const { nome, user_type, serie, subject } = req.body;

        const updateData = { nome, user_type, serie, subject };

        // Remove campos nulos/indefinidos do objeto de atualização
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        if (Object.keys(updateData).length === 0) {
            return next(createError(400, 'Nenhum dado válido fornecido para atualização.'));
        }

        const updatedUser = await UserRepository.update(id, updateData);

        if (!updatedUser) {
            return next(createError(404, 'Usuário não encontrado para atualização.'));
        }

        // Remove o hash da senha antes de enviar
        const { /*password_hash, */...userResponse } = updatedUser;
        res.json({ message: 'Usuário atualizado com sucesso.', user: userResponse });

    } catch (error) {
        // Tratar erros de TypeORM (ex: violação de constraint) aqui
        console.error("Erro ao atualizar usuário:", error.message);
        next(createError(500, 'Falha interna ao atualizar usuário.'));
    }
};

/**
 * Lida com a remoção de um usuário pelo ID. (DELETE /users/:id)
 * @type {RequestHandler}
 */
export const deleteUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return next(createError(400, 'ID de usuário inválido.'));

        const wasRemoved = await UserRepository.remove(id);

        if (!wasRemoved) {
            return next(createError(404, 'Usuário não encontrado para exclusão.'));
        }

        res.status(204).send(); // 204 No Content para sucesso na exclusão
    } catch (error) {
        console.error("Erro ao deletar usuário:", error.message);
        next(createError(500, 'Falha interna ao deletar usuário.'));
    }
};
