import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const TENANT_ID = '42a401e2-7d75-4859-8538-000363fe1b26';

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

describe('User API', () => {
  let authToken: string;
  let testUserEmail: string;
  let testUserPassword: string;
  let createdUserId: string;

  beforeAll(async () => {
    // Registrar e fazer login para obter token
    testUserEmail = `user-test-${Date.now()}@example.com`;
    testUserPassword = 'password123';

    const registerResponse = await api.post('/auth/register', {
      email: testUserEmail,
      password: testUserPassword,
      role: 'User',
    });

    expect(registerResponse.status).toBe(201);
    authToken = registerResponse.data.token;
  });

  describe('POST /users', () => {
    it('deve criar um novo usuário com sucesso', async () => {
      const newUserEmail = `new-user-${Date.now()}@example.com`;
      const response = await api.post(
        '/users',
        {
          email: newUserEmail,
          password: testUserPassword,
          role: 'User',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('email', newUserEmail);
      expect(response.data).toHaveProperty('created_at');
      
      createdUserId = response.data.id;
    });

    it('deve criar um usuário com tenant_id específico', async () => {
      const newUserEmail = `tenant-user-${Date.now()}@example.com`;
      const response = await api.post(
        '/users',
        {
          email: newUserEmail,
          password: testUserPassword,
          tenant_id: TENANT_ID,
          role: 'User',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.email).toBe(newUserEmail);
    });

    it('deve retornar erro 401 ao criar usuário sem token', async () => {
      const response = await api.post('/users', {
        email: `no-token-${Date.now()}@example.com`,
        password: testUserPassword,
        role: 'User',
      });

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 400 ao criar usuário com email inválido', async () => {
      const response = await api.post(
        '/users',
        {
          email: 'email-invalido',
          password: testUserPassword,
          role: 'User',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(400);
    });

    it('deve retornar erro 400 ao criar usuário com senha vazia', async () => {
      const response = await api.post(
        '/users',
        {
          email: `empty-password-${Date.now()}@example.com`,
          password: '',
          role: 'User',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(400);
    });
  });

  describe('GET /users', () => {
    it('deve listar todos os usuários com sucesso', async () => {
      const response = await api.get('/users', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0]).toHaveProperty('id');
      expect(response.data[0]).toHaveProperty('email');
    });

    it('deve retornar erro 401 ao listar usuários sem token', async () => {
      const response = await api.get('/users');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /users/:id', () => {
    it('deve obter um usuário específico por ID com sucesso', async () => {
      // Primeiro criar um usuário
      const newUserEmail = `get-user-${Date.now()}@example.com`;
      const createResponse = await api.post(
        '/users',
        {
          email: newUserEmail,
          password: testUserPassword,
          role: 'User',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(createResponse.status).toBe(201);
      const userId = createResponse.data.id;

      // Buscar o usuário
      const getResponse = await api.get(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(getResponse.status).toBe(200);
      expect(getResponse.data).toHaveProperty('id', userId);
      expect(getResponse.data).toHaveProperty('email', newUserEmail);
    });

    it('deve retornar erro 404 ao buscar usuário inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await api.get(`/users/${fakeId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });

    it('deve retornar erro 400 ao buscar com ID inválido', async () => {
      const response = await api.get('/users/invalid-id', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(400);
    });

    it('deve retornar erro 401 ao buscar usuário sem token', async () => {
      const response = await api.get(`/users/${createdUserId || '00000000-0000-0000-0000-000000000000'}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /users/:id', () => {
    it('deve atualizar um usuário com sucesso', async () => {
      // Criar um usuário
      const newUserEmail = `update-user-${Date.now()}@example.com`;
      const createResponse = await api.post(
        '/users',
        {
          email: newUserEmail,
          password: testUserPassword,
          role: 'User',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(createResponse.status).toBe(201);
      const userId = createResponse.data.id;

      // Atualizar o usuário
      const updateResponse = await api.patch(
        `/users/${userId}`,
        {
          email: `updated-${Date.now()}@example.com`,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data).toHaveProperty('id', userId);
    });

    it('deve retornar erro 404 ao atualizar usuário inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await api.patch(
        `/users/${fakeId}`,
        {
          email: `updated-${Date.now()}@example.com`,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(404);
    });

    it('deve retornar erro 400 ao atualizar com email inválido', async () => {
      if (!createdUserId) {
        // Criar um usuário se não existir
        const createResponse = await api.post(
          '/users',
          {
            email: `temp-${Date.now()}@example.com`,
            password: testUserPassword,
            role: 'User',
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        createdUserId = createResponse.data.id;
      }

      const response = await api.patch(
        `/users/${createdUserId}`,
        {
          email: 'email-invalido',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(400);
    });

    it('deve retornar erro 401 ao atualizar usuário sem token', async () => {
      const response = await api.patch(`/users/${createdUserId || '00000000-0000-0000-0000-000000000000'}`, {
        email: `updated-${Date.now()}@example.com`,
      });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /users/:id', () => {
    it('deve deletar um usuário com sucesso', async () => {
      // Criar um usuário para deletar
      const newUserEmail = `delete-user-${Date.now()}@example.com`;
      const createResponse = await api.post(
        '/users',
        {
          email: newUserEmail,
          password: testUserPassword,
          role: 'User',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(createResponse.status).toBe(201);
      const userId = createResponse.data.id;

      // Deletar o usuário
      const deleteResponse = await api.delete(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(deleteResponse.status).toBe(204);

      // Verificar que o usuário foi deletado
      const getResponse = await api.get(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(getResponse.status).toBe(404);
    });

    it('deve retornar erro 404 ao deletar usuário inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await api.delete(`/users/${fakeId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });

    it('deve retornar erro 401 ao deletar usuário sem token', async () => {
      const response = await api.delete(`/users/${createdUserId || '00000000-0000-0000-0000-000000000000'}`);

      expect(response.status).toBe(401);
    });
  });
});

