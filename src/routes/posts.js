import PostsController from '../controllers/posts.controller.js';
import { withDbInit } from '../middleware/withDbInit.js';
import { Router } from 'express';
import { autenticar } from '../middleware/auth.js';

const router = Router();

router.get("/", autenticar, withDbInit(PostsController.getAllPosts));
router.get("/search", autenticar, withDbInit(PostsController.searchPosts)); 
router.get("/:id", autenticar, withDbInit(PostsController.getPostById));
router.post("/", autenticar, withDbInit(PostsController.createPost));
router.put("/:id", autenticar, withDbInit(PostsController.updatePost)); 
router.delete("/:id", autenticar, withDbInit(PostsController.deletePost)); 

export default router;