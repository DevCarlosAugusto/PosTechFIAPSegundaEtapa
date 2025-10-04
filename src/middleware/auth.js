// middleware/auth.js
import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'segredo-super-seguro';

export function autenticar(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload; // agora você tem acesso ao tipo de usuário
    next();
  } catch (error) {
    return res.status(403).json({ ...error, error: 'Token inválido ou expirado.' });
  }
}
