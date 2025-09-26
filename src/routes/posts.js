import PostsController from '../controllers/PostsController.js';

import { Router } from 'express';

const router = Router();

router.get("/", PostsController.getAllPosts);
router.get("/:id", PostsController.getPostById);

export default router;