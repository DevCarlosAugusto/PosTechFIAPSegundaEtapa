import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

import app from '../app.js';
import UserRepository from '../src/models/user.model.js';
import PostRepository from '../src/models/post.model.js'; // Assumindo o caminho do modelo de Post

// --- Variáveis de Autenticação e Dados ---
let authToken;
let authUserId;

// Payload para o usuário que será usado em todos os testes autenticados
const testUserAuthPayload = {
    nome: 'Post Author',
    email: 'post.author@escola.com',
    password: 'postPassword123',
    user_type: 'ALUNO',
    serie: '9º Ano',
};

// Payload base para a criação de um post
const basePostPayload = {
    title: 'Título de Teste do Post',
    content: 'Conteúdo do post de teste.',
};


// --- SETUP GLOBAL (Autenticação) ---

beforeAll(async () => {
    // 1. Cria o usuário diretamente no DB
    const createdUser = await UserRepository.create(testUserAuthPayload);
    authUserId = createdUser.id;

    // 2. Simula o login para obter um token JWT
    const response = await request(app)
        .post('/auth/login')
        .send({
            email: testUserAuthPayload.email,
            password: testUserAuthPayload.password,
        });

    expect(response.statusCode).toBe(200);
    authToken = response.body.token;
    expect(authToken).toBeDefined();
});

afterAll(async () => {
    // Limpa o usuário de autenticação no final de todos os testes
    if (authUserId) {
        await UserRepository.remove(authUserId);
    }
});


// --- SUÍTE 1: Rotas Não Autenticadas (GET) ---

describe('Rotas de Leitura de Posts (GET /posts)', () => {
    let postId;

    // Cria um post antes da suíte para garantir que há algo para ler
    beforeAll(async () => {
        const post = await PostRepository.create({
            ...basePostPayload,
            author_id: authUserId,
        });
        postId = post.id;
    });

    afterAll(async () => {
        // Limpa o post de leitura
        if (postId) {
            await PostRepository.remove(postId);
        }
    });

    test('1. GET /posts - Deve retornar status 200 e uma lista de posts', async () => {
        const response = await request(app)
            .get('/posts');

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThan(0);
        // Verifica se o objeto post tem as propriedades básicas
        expect(response.body[0]).toHaveProperty('title');
        expect(response.body[0]).toHaveProperty('content');
    });

    test('2. GET /posts/:id - Deve retornar status 200 e o post específico', async () => {
        const response = await request(app)
            .get(`/posts/${postId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id', postId);
        expect(response.body).toHaveProperty('title', basePostPayload.title);
    });

    test('3. GET /posts/:id - Deve retornar 404 se o post não existir', async () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app)
            .get(`/posts/${nonExistentId}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Post não encontrado.');
    });
});


// --- SUÍTE 2: Rotas Autenticadas (POST, PUT, DELETE) ---

describe('Rotas de Manipulação de Posts (POST, PUT, DELETE)', () => {

    let createdPostId;

    // Limpa o post criado após cada teste desta suíte (para garantir o POST)
    afterEach(async () => {
        if (createdPostId) {
            await PostRepository.remove(createdPostId);
            createdPostId = null; // Zera para evitar deleção dupla
        }
    });


    // --- POST /posts ---
    describe('POST /posts', () => {

        test('4. Deve criar um novo post com sucesso e retornar 201', async () => {
            const response = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(basePostPayload);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.title).toBe(basePostPayload.title);

            createdPostId = response.body.id; // Salva para o afterEach
        });

        test('5. Deve retornar 400 se o payload for inválido (faltando title)', async () => {
            const response = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Conteúdo sem título' });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('Dados de entrada inválidos.');
        });

        test('6. Deve retornar 401 se tentar criar post sem autenticação', async () => {
            const response = await request(app)
                .post('/posts')
                .send(basePostPayload);

            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Token de autenticação ausente.');
        });
    });

    // --- PUT /posts/:id ---
    describe('PUT /posts/:id', () => {
        let postIdToUpdate;

        // Cria um post específico para ser atualizado neste bloco
        beforeEach(async () => {
            const post = await PostRepository.create({
                ...basePostPayload,
                author_id: authUserId,
            });
            postIdToUpdate = post.id;
        });

        afterEach(async () => {
            // Garante que o post é limpo, mesmo se o teste falhar
            if (postIdToUpdate) {
                await PostRepository.remove(postIdToUpdate);
            }
        });

        test('7. Deve atualizar o título do post com sucesso e retornar 200', async () => {
            const newTitle = 'Título Atualizado Teste';

            const response = await request(app)
                .put(`/posts/${postIdToUpdate}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: newTitle });

            expect(response.statusCode).toBe(200);
            expect(response.body.title).toBe(newTitle);
        });

        test('8. Deve retornar 404 se tentar atualizar um post que não existe', async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';

            const response = await request(app)
                .put(`/posts/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: 'Novo Título' });

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Post não encontrado.');
        });
    });


    // --- DELETE /posts/:id ---
    describe('DELETE /posts/:id', () => {
        let postIdToDelete;

        // Cria um post específico para ser deletado neste bloco
        beforeEach(async () => {
            const post = await PostRepository.create({
                ...basePostPayload,
                author_id: authUserId,
            });
            postIdToDelete = post.id;
        });

        // Não precisamos de afterEach aqui, pois o post deve ser deletado pelo teste.

        test('9. Deve deletar o post com sucesso e retornar 204 No Content', async () => {
            const response = await request(app)
                .delete(`/posts/${postIdToDelete}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(204);
            expect(response.body).toEqual({}); // Deve ser vazio

            // Confirma no banco
            const deletedPost = await PostRepository.findById(postIdToDelete);
            expect(deletedPost).toBeNull();
        });

        test('10. Deve retornar 404 se tentar deletar um post que não existe', async () => {
            const nonExistentId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

            const response = await request(app)
                .delete(`/posts/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Post não encontrado.');
        });

        // 🚨 Adicionar teste para Autorização (tentar deletar post de outro usuário)
        // Isso exigiria criar um segundo usuário e seu token, mas vamos manter a complexidade baixa por enquanto.
    });
});