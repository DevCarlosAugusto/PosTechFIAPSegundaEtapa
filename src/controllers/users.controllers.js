import User from '../models/user.js';
import bcrypt from 'bcrypt';

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "João Silva"
 *         email:
 *           type: string
 *           example: "joao.silva@email.com"
 *         senha:
 *           type: string
 *           example: "hashed_password"
 *         perfil:
 *           type: string
 *           example: "admin"
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Mensagem de erro"
 */






const UsersController = {
  /**
 * @openapi
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 *       500:
 *         description: Erro ao buscar usuários
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
    async getAllUsers(req, res) {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) {
            console.error('Erro ao buscar users:', error);
            res.status(500).json({ error: `Erro ao buscar users ${error.message}` });
        }
    },
/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Busca um usuário por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Erro ao buscar usuário
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

    async getUserById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'User não encontrado' });
            res.json(user);
        } catch (error) {
            console.error('Erro ao buscar user:', error);
            res.status(500).json({ error: `Erro ao buscar user: ${error.message}` });
        }
    },

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do usuário
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 description: Email do usuário
 *                 example: joao.silva@email.com
 *               senha:
 *                 type: string
 *                 description: Senha do usuário
 *                 example: senha123
 *               perfil:
 *                 type: string
 *                 description: Perfil do usuário
 *                 example: admin
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Campos obrigatórios ausentes
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Erro ao criar usuário
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

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
            if (error.code === '23505' && error.constraint === 'usuarios_email_key') {
              return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
            }
            res.status(500).json({ error: `Erro ao criar user: ${error.message}` });
        }
    },
/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Atualiza um usuário existente
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do usuário
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 description: Email do usuário
 *                 example: joao.silva@email.com
 *               perfil:
 *                 type: string
 *                 description: Perfil do usuário
 *                 example: admin
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Campos obrigatórios ausentes
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Erro ao atualizar usuário
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

  async updateUser(req, res) {
    const id = parseInt(req.params.id, 10);
    const { nome, email, perfil } = req.body;

    if (!nome || !email || !perfil) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, email, perfil.' });
    }

    if (req.user.perfil === 'aluno') {
      if (req.user.id != id) {
        return res.status(401).json({ error: 'Sem permissão para alteração do usuário.' });
      }
    }

    try {
      const userAtualizado = await User.update(id, { nome, email, perfil });
      if (!userAtualizado) return res.status(404).json({ error: 'User não encontrado.' });
      res.json(userAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar user:', error);

      if (error.code === '23505' && error.constraint === 'usuarios_email_key') {
        return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
      }
      
      res.status(500).json({ error: `Erro ao atualizar user: ${error.message}` });
    }
  },
/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Exclui um usuário por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário a ser excluído
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário com ID 1 foi excluído com sucesso.
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Erro ao excluir usuário
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

  async deleteUser(req, res) {
    const id = parseInt(req.params.id, 10);

    try {
      const sucesso = await User.remove(id);
      if (!sucesso) return res.status(404).json({ error: 'User não encontrado.' });
      res.status(200).json({ message: `User com ID ${id} foi excluído com sucesso.` });
    } catch (error) {
      console.error('Erro ao excluir user:', error);
      res.status(500).json({ error: `Erro ao excluir user: ${error.message}` });
    }
  },

};

export default UsersController;
