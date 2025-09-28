import PostsController from '../controllers/PostsController.js';
import { withDbInit } from '../middleware/withDbInit.js';
import { Router } from 'express';

const router = Router();

router.get("/", withDbInit(PostsController.getAllPosts));
router.get("/search", withDbInit(PostsController.searchPosts)); 
router.get("/:id", withDbInit(PostsController.getPostById));
router.post("/", withDbInit(PostsController.createPost));
router.put("/:id", withDbInit(PostsController.updatePost)); 
router.delete("/:id", withDbInit(PostsController.deletePost)); 

export default router;