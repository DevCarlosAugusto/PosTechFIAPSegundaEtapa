import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import UserRepository from '../models/user.model.js';

const SECRET = process.env.JWT_SECRET || 'segredo-super-secreto';

/**
 * @typedef {import('express').RequestHandler} RequestHandler
 */

/**
 * Lida com a autenticação (Login) de um usuário.
 * POST /auth/login
 * @type {RequestHandler}
 */
export const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(createError(400, 'Email e senha são obrigatórios.'));
    }

    try {
        const user = await UserRepository.findByEmail(email);

        if (!user) {
            return next(createError(401, 'Credenciais inválidas.'));
        }

        const isPasswordValid = await UserRepository.comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            return next(createError(401, 'Credenciais inválidas.'));
        }

        const token = jwt.sign(
            { id: user.id, user_type: user.user_type, email: user.email }, // Usando user_type
            SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            token,
            user_type: user.user_type,
            id: user.id,
            nome: user.nome
        });

    } catch (error) {
        console.error('Erro no login do usuário:', error.message);
        next(createError(500, 'Falha interna ao realizar o login.'));
    }
};
