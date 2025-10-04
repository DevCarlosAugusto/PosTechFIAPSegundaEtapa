import { Router } from 'express';
// Note: registerUser e as funções CRUD foram movidas para users.controller.js
import {
    registerUser,
    listAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/users.controller.js';

const router = Router();

/**
 * Rota POST para registro de novo usuário.
 * POST /users/register
 */
router.post('/register', registerUser);

router.get('/', listAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
