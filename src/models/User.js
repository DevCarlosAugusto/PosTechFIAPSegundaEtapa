import { query } from '../../database/db.js';

const User = {
    async findAll() {
        const result = await query(`
            SELECT 
                * 
            FROM 
                usuarios 
            ORDER BY id
        `);
        return result.rows;
    },

    async findById(id) {
        const result = await query(`
            SELECT 
                * 
            FROM 
                usuarios 
            WHERE 
                id = $1
        `, [id]);
        return result.rows[0];
    },

    async create({ nome, email, senha, perfil }) {
        const result = await query(`
            INSERT INTO usuarios (nome, email, senha, perfil) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, nome, email, perfil
        `, [nome, email, senha, perfil]);

        return result.rows[0];
    },

    async update(id, { nome, email, perfil }) {
        const result = await query(`
            UPDATE usuarios
            SET nome = $1, email = $2, perfil = $3
            WHERE id = $4
            RETURNING id, nome, email, perfil
        `, [nome, email, perfil, id]);

        return result.rows[0];
    },

    async remove(id) {
        const result = await query(`
            DELETE FROM usuarios
            WHERE id = $1
        `, [id]);

        return result.rowCount > 0;
    },

};

export default User;