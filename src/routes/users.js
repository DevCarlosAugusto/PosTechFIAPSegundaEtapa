import UsersController from '../controllers/UsersControllers.js';
import { withDbInit } from '../middleware/withDbInit.js';
import { Router } from 'express';

const router = Router();

router.get("/", withDbInit(UsersController.getAllUsers));
router.get("/:id", withDbInit(UsersController.getUserById));
router.post("/", withDbInit(UsersController.createUser));
router.put("/:id", withDbInit(UsersController.updateUser)); 
router.delete("/:id", withDbInit(UsersController.deleteUser)); 

export default router;
