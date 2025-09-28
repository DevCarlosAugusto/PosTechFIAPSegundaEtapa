import User from '../models/User.js';
import bcrypt from 'bcrypt';

const UsersController = {
    async getAllUsers(req, res) {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) {
            console.error('Erro ao buscar users:', error);
            res.status(500).json({ error: `Erro ao buscar users ${error.message}` });
        }
    },

    async getUserById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'User não encontrado' });
            res.json(user);
        } catch (error) {
            console.error('Erro ao buscar user:', error);
            res.status(500).json({ error: 'Erro ao buscar user' });
        }
    },

    async createUser(req, res) {
        const { nome, email, senha, perfil } = req.body;

        if (!nome || !email || !senha || !perfil) {
            return res.status(400).json({ error: 'Campos obrigatórios: nome, email, senha, perfil.' });
        }

        try {
            const saltRounds = 10;
            const senhaHash = await bcrypt.hash(senha, saltRounds);            
            const novoUser = await User.create({ nome, email, senha: senhaHash, perfil });
            res.status(201).json(novoUser);
        } catch (error) {
            console.error('Erro ao criar user:', error);
            res.status(500).json({ error: 'Erro ao criar user' });
        }
    },

  async updateUser(req, res) {
    const id = parseInt(req.params.id, 10);
    const { nome, email, perfil } = req.body;

    if (!nome || !email || !perfil) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, email, perfil.' });
    }

    try {
      const userAtualizado = await User.update(id, { nome, email, perfil });
      if (!userAtualizado) return res.status(404).json({ error: 'User não encontrado.' });
      res.json(userAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar user:', error);
      res.status(500).json({ error: 'Erro ao atualizar user.' });
    }
  },

  async deleteUser(req, res) {
    const id = parseInt(req.params.id, 10);

    try {
      const sucesso = await User.remove(id);
      if (!sucesso) return res.status(404).json({ error: 'User não encontrado.' });
      res.status(200).json({ message: `User com ID ${id} foi excluído com sucesso.` });
    } catch (error) {
      console.error('Erro ao excluir user:', error);
      res.status(500).json({ error: 'Erro ao excluir user.' });
    }
  },

};

export default UsersController;
