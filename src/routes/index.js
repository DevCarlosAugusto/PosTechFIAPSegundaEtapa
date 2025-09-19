import { Router } from 'express';
import HomeController from '../controllers/IndexController.js';

const router = Router();

router.get('/', HomeController.getHomePage);

export default router;
