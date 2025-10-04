import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';

const router = Router();

/**
 * Rota POST para login de usuário.
 * POST /auth/login
 */
router.post('/login', login);

export default router;
