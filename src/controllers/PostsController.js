import Post from '../models/Post.js';

const PostsController = {
  async getAllPosts(req, res) {
    try {
    console.log("Testando")
      const posts = await Post.findAll();
      res.json(posts);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    res.status(500).json({ error: `Erro ao buscar posts ${error.message}` });
    }
  },

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
