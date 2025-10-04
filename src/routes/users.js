import UsersController from '../controllers/users.controllers.js';
// import { withDbInit } from '../middleware/withDbInit.js';
import { Router } from 'express';
import { autenticar } from '../middleware/auth.js';

const router = Router();

router.get("/", autenticar, withDbInit(UsersController.getAllUsers));
router.get("/:id", autenticar, withDbInit(UsersController.getUserById));
router.post("/", withDbInit(UsersController.createUser));
router.put("/:id", autenticar, withDbInit(UsersController.updateUser)); 
router.delete("/:id", autenticar, withDbInit(UsersController.deleteUser)); 

export default router;
