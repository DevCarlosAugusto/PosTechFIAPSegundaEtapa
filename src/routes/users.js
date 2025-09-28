// src/routes/users.js
import express from 'express';
import * as db from '../../database/db.js';
import { withDbInit } from '../middleware/withDbInit.js';

const router = express.Router();

// lista usuários
router.get('/', withDbInit(async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, nome, email, perfil FROM usuarios ORDER BY id'
  );
  res.json(rows);
}));

// teste simples do DB
router.get('/dbtest', withDbInit(async (req, res) => {
  const { rows } = await db.query('SELECT 1 AS ok');
  res.json(rows[0]);
}));

export default router;
