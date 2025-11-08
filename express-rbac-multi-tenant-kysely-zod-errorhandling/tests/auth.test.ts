import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true, // Não lançar erro em qualquer status
});

describe('Auth API', () => {
  let testUserEmail: string;
  let testUserPassword: string;
  let authToken: string;

  beforeAll(() => {
    // Gerar email único para cada execução
    testUserEmail = `test-${Date.now()}@example.com`;
    testUserPassword = 'password123';
  });

  describe('POST /auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const response = await api.post('/auth/register', {
        email: testUserEmail,
        password: testUserPassword,
        role: 'User',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('roles');
      expect(response.data.user).toHaveProperty('email', testUserEmail);
      expect(response.data.user).toHaveProperty('id');
      expect(typeof response.data.token).toBe('string');
      expect(response.data.token.length).toBeGreaterThan(0);
    });

    it('deve registrar um usuário Admin com sucesso', async () => {
      const adminEmail = `admin-${Date.now()}@example.com`;
      const response = await api.post('/auth/register', {
        email: adminEmail,
        password: testUserPassword,
        role: 'Admin',
      });

      expect(response.status).toBe(201);
      expect(response.data.user.email).toBe(adminEmail);
      expect(response.data.roles).toBeDefined();
    });

    it('deve registrar um usuário Manager com sucesso', async () => {
      const managerEmail = `manager-${Date.now()}@example.com`;
      const response = await api.post('/auth/register', {
        email: managerEmail,
        password: testUserPassword,
        role: 'Manager',
      });

      expect(response.status).toBe(201);
      expect(response.data.user.email).toBe(managerEmail);
    });

    it('deve retornar erro 400 ao tentar registrar com email inválido', async () => {
      const response = await api.post('/auth/register', {
        email: 'email-invalido',
        password: testUserPassword,
        role: 'User',
      });

      expect(response.status).toBe(400);
    });

    it('deve retornar erro 400 ao tentar registrar com senha muito curta', async () => {
      const response = await api.post('/auth/register', {
        email: `short-${Date.now()}@example.com`,
        password: '1234567', // Menos de 8 caracteres
        role: 'User',
      });

      expect(response.status).toBe(400);
    });

    it('deve retornar erro 400 ao tentar registrar com senha muito longa', async () => {
      const longPassword = 'a'.repeat(71); // Mais de 70 caracteres
      const response = await api.post('/auth/register', {
        email: `long-${Date.now()}@example.com`,
        password: longPassword,
        role: 'User',
      });

      expect(response.status).toBe(400);
    });

    it('deve retornar erro 400 ao tentar registrar com role inválida', async () => {
      const response = await api.post('/auth/register', {
        email: `invalid-role-${Date.now()}@example.com`,
        password: testUserPassword,
        role: 'InvalidRole',
      });

      expect(response.status).toBe(400);
    });

    it('deve retornar erro ao tentar registrar com email duplicado', async () => {
      // Primeiro registro
      await api.post('/auth/register', {
        email: testUserEmail,
        password: testUserPassword,
        role: 'User',
      });

      // Tentativa de registro duplicado
      const response = await api.post('/auth/register', {
        email: testUserEmail,
        password: testUserPassword,
        role: 'User',
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /auth/login', () => {
    it('deve fazer login com sucesso', async () => {
      // Primeiro registrar um usuário
      const registerResponse = await api.post('/auth/register', {
        email: `login-${Date.now()}@example.com`,
        password: testUserPassword,
        role: 'User',
      });

      expect(registerResponse.status).toBe(201);
      const registeredEmail = registerResponse.data.user.email;

      // Fazer login
      const loginResponse = await api.post('/auth/login', {
        email: registeredEmail,
        password: testUserPassword,
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('user');
      expect(loginResponse.data).toHaveProperty('token');
      expect(loginResponse.data).toHaveProperty('roles');
      expect(loginResponse.data.user.email).toBe(registeredEmail);
      expect(typeof loginResponse.data.token).toBe('string');
      
      authToken = loginResponse.data.token;
    });

    it('deve retornar erro 401 ao fazer login com credenciais inválidas', async () => {
      const response = await api.post('/auth/login', {
        email: `nonexistent-${Date.now()}@example.com`,
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 400 ao fazer login com email inválido', async () => {
      const response = await api.post('/auth/login', {
        email: 'email-invalido',
        password: testUserPassword,
      });

      expect(response.status).toBe(400);
    });

    it('deve retornar erro 400 ao fazer login com senha muito curta', async () => {
      const response = await api.post('/auth/login', {
        email: `test-${Date.now()}@example.com`,
        password: '1234567',
      });

      expect(response.status).toBe(400);
    });

    it('deve retornar erro 401 ao fazer login com senha incorreta', async () => {
      // Registrar um usuário
      const registerResponse = await api.post('/auth/register', {
        email: `wrong-password-${Date.now()}@example.com`,
        password: testUserPassword,
        role: 'User',
      });

      expect(registerResponse.status).toBe(201);
      const registeredEmail = registerResponse.data.user.email;

      // Tentar login com senha errada
      const loginResponse = await api.post('/auth/login', {
        email: registeredEmail,
        password: 'wrongpassword123',
      });

      expect(loginResponse.status).toBe(401);
    });
  });
});

