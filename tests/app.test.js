const request = require('supertest');
const app = require('../app');

describe('Teste da rota /ping', () => {
  it('deve retornar pong', async () => {
    const res = await request(app).get('/ping');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('pong');
  });
});
