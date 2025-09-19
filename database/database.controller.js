const fs = require('fs');
const path = require('path');
const db = require('./db');

const scriptPath = path.join(__dirname, 'educablog.sql');

exports.setupDatabase = async (req, res) => {
  try {
    const sqlScript = fs.readFileSync(scriptPath, 'utf8');
    const queries = sqlScript.split(';').filter(q => q.trim() !== '');

    console.log('Iniciando a execução do script SQL...');

    for (const query of queries) {
      await db.query(query);
    }
    
    console.log('Script SQL executado com sucesso!');
    res.status(200).send('Banco de dados "educablog" e tabelas criadas com sucesso!');

  } catch (error) {
    console.error('Erro ao executar o script SQL:', error);
    res.status(500).send('Erro ao configurar o banco de dados: ' + error.message);
  }
};