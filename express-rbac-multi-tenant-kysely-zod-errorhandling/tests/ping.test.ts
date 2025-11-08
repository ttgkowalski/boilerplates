import { describe, it, expect } from 'vitest';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

describe('Ping API', () => {
  it('deve retornar Pong no endpoint /ping', async () => {
    const response = await api.get('/ping');

    expect(response.status).toBe(200);
    expect(response.data).toBe('Pong');
  });
});
