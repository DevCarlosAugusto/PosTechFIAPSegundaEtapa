import { query } from '../../database/db.js';

const Post = {
  async findAll() {
    console.log('Método findAll foi chamado'); 
    const result = await query(`
      SELECT * FROM posts
    `);
    return result.rows;
  },

  async findById(id) {
    const result = await query(`
      SELECT posts.*, usuarios.nome AS autor_nome
      FROM posts
      JOIN usuarios ON posts.autor_id = usuarios.id
      WHERE posts.id = $1
    `, [id]);
    return result.rows[0];
  },
};

export default Post;