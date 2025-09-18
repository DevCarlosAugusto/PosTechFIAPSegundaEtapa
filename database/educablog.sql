CREATE DATABASE educablog;

-- Conectar ao banco
\c educablog;

-- Criar tabela de usuários (professores e alunos)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(200) NOT NULL, -- hash da senha
    perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('professor','aluno')),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de posts
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    autor_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar função para atualizar campo atualizado_em automaticamente
CREATE OR REPLACE FUNCTION atualizar_data_modificacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para chamar a função antes de cada UPDATE
CREATE TRIGGER trigger_atualizacao_post
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION atualizar_data_modificacao();
