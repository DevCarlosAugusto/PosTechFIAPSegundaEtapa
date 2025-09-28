// PostsControllers.js
import Post from '../models/Post.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Meu primeiro post"
 *         content:
 *           type: string
 *           example: "Conteúdo do post..."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-09-28T12:34:56.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-09-28T12:34:56.000Z"
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Mensagem de erro"
 */

/**
 * @openapi
 * /api/posts:
 *   get:
 *     summary: Lista todos os posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Lista de posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Post' }
 *       500:
 *         description: Erro ao buscar posts
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
const PostsController = {
  async getAllPosts(req, res) {
    try {
      const posts = await Post.findAll();
      res.json(posts);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      res.status(500).json({ error: `Erro ao buscar posts ${error.message}` });
    }
  },

  /**
   * @openapi
   * /api/posts/{id}:
   *   get:
   *     summary: Busca um post por ID
   *     tags: [Posts]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *         description: ID do post
   *     responses:
   *       200:
   *         description: Post encontrado
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Post' }
   *       404:
   *         description: Post não encontrado
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   *       500:
   *         description: Erro ao buscar post
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   */
  async getPostById(req, res) {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post não encontrado' });
      res.json(post);
    } catch (error) {
      console.error('Erro ao buscar post:', error);
      res.status(500).json({ error: 'Erro ao buscar post' });
    }
  },
};

export default PostsController;
