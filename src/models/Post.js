import { query } from '../../database/db.js';

const Post = {
  async findAll() {
    console.log('Método findAll foi chamado'); 
    const result = await query(`
      SELECT 
        posts.*, 
        usuarios.nome AS autor_nome
      FROM 
        posts
      JOIN usuarios 
        ON posts.autor_id = usuarios.id
    `);
    return result.rows;
  },

  async findById(id) {
    const result = await query(`
      SELECT 
        posts.*, 
        usuarios.nome AS autor_nome
      FROM 
        posts
      JOIN usuarios 
        ON posts.autor_id = usuarios.id
      WHERE 
        posts.id = $1
    `, [id]);
    return result.rows[0];
  },

  async create({ titulo, conteudo, autor_id }) {
    const result = await query(`
      INSERT INTO posts (titulo, conteudo, autor_id)
      VALUES ($1, $2, $3)
      RETURNING id, titulo, conteudo, autor_id
    `, [titulo, conteudo, autor_id]);

    return result.rows[0];
  },

  async update(id, { titulo, conteudo }) {
    const result = await query(`
      UPDATE posts
      SET titulo = $1, conteudo = $2
      WHERE id = $3
      RETURNING id, titulo, conteudo, autor_id
    `, [titulo, conteudo, id]);

    return result.rows[0];
  },

  async remove(id) {
    const result = await query(`
      DELETE FROM posts
      WHERE id = $1
    `, [id]);

    return result.rowCount > 0;
  },

  async search(termo) {
    const result = await query(`
      SELECT 
        posts.*, 
        usuarios.nome AS autor_nome
      FROM posts
      JOIN usuarios 
        ON posts.autor_id = usuarios.id
      WHERE 
        posts.titulo ILIKE $1 
        OR posts.conteudo ILIKE $1
    `, [`%${termo}%`]);

    return result.rows;
  }
};

export default Post;