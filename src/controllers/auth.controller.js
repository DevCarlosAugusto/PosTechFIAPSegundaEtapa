import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.js';

const SECRET = process.env.JWT_SECRET || 'segredo-super-seguro';

export async function login(req, res) {
  const { email, senha } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: `Usuário não encontrado: ${email} ${user}` });

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) return res.status(401).json({ error: 'Senha incorreta.' });

    const token = jwt.sign(
      { id: user.id, perfil: user.perfil },
      SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, 'perfil': user.perfil});
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no login.' });
  }
}
