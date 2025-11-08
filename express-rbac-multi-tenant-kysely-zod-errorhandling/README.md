# Express RBAC Multi-Tenant Boilerplate

Boilerplate completo para projetos Express.js com autenticação JWT, controle de acesso baseado em roles (RBAC), suporte multi-tenant, validação com Zod, e tratamento de erros.

## 🚀 Tecnologias

- **Express.js 5** - Framework web
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados
- **Kysely** - Query builder type-safe
- **Knex** - Migrations
- **Zod** - Validação de schemas
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Vitest** - Testes

## 📋 Pré-requisitos

- Node.js (versão 18+)
- pnpm (versão 10+)
- Docker e Docker Compose (para banco de dados)

## ⚙️ Configuração Inicial

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DB_HOST=localhost
DB_NAME=nome_do_banco
DB_USER=usuario
DB_PASSWORD=senha
DB_PORT=5432
JWT_SECRET=seu_secret_jwt_aqui
```

### 3. Subir o banco de dados

```bash
pnpm run compose:up
```

### 4. Executar migrations

```bash
pnpm run migrate:latest
```

### 5. Rodar a aplicação

```bash
pnpm run start
```

### 6. Rodar os testes

```bash
pnpm run test
```

## 🏃 Como Rodar

### Desenvolvimento

```bash
pnpm start
```

O servidor estará rodando em `http://localhost:3000`

### Build para produção

```bash
pnpm run build
```

## 📁 Estrutura do Projeto

```
express-rbac-multi-tenant-kysely-zod-errorhandling/
├── domain/              # Domínios da aplicação (schemas e tabelas)
│   ├── authentication/  # Schemas de autenticação
│   ├── user/            # Schemas e tabelas de usuário
│   ├── role/            # Tabelas de roles
│   ├── tenant/          # Tabelas de tenant
│   └── user-role/       # Tabelas de relacionamento
├── src/
│   ├── auth/            # Rotas, controller e service de autenticação
│   ├── user/            # Rotas, controller, service e repo de usuário
│   ├── middlewares/     # Middlewares (auth, validação, error handler)
│   ├── errors/          # Classes de erro customizadas
│   └── db.ts            # Configuração do banco de dados
├── migrations/          # Migrations do Knex
├── tests/               # Testes
└── scripts/              # Scripts auxiliares
```

## 📜 Scripts Disponíveis

### Desenvolvimento
- `pnpm start` - Inicia o servidor em modo watch
- `pnpm run build` - Compila o TypeScript

### Banco de Dados
- `pnpm run compose:up` - Sobe o PostgreSQL via Docker
- `pnpm run compose:down` - Para o PostgreSQL
- `pnpm run migrate:make <nome>` - Cria uma nova migration
- `pnpm run migrate:latest` - Executa todas as migrations pendentes
- `pnpm run migrate:rollback` - Reverte a última migration
- `pnpm run migrate:rollback:all` - Reverte todas as migrations
- `pnpm run migrate:list` - Lista todas as migrations

### Testes
- `pnpm test` - Executa os testes
- `pnpm run test:watch` - Executa os testes em modo watch
- `pnpm run test:ui` - Abre a UI do Vitest
- `pnpm run clean:test` - Limpa dados de teste

## 🔐 Funcionalidades

### Autenticação
- Registro de usuário (`POST /auth/register`)
- Login (`POST /auth/login`)
- Tokens JWT com informações de roles e tenant

### Controle de Acesso (RBAC)
- Middleware `requireRole()` para proteger rotas
- Suporte a múltiplas roles
- Verificação automática de permissões

### Multi-Tenant
- Suporte a múltiplos tenants
- Isolamento de dados por tenant
- Tenant ID incluído no token JWT

### Validação
- Validação automática de schemas com Zod
- Middleware `validateSchema()` para validar body, params e query

### Tratamento de Erros
- Classes de erro customizadas
- Error handler global
- Respostas de erro padronizadas

## 🎯 Como Usar em Novos Projetos

1. **Copie este repositório** para seu novo projeto
2. **Renomeie o projeto** no `package.json`
3. **Configure as variáveis de ambiente** no `.env`
4. **Ajuste as migrations** conforme necessário
5. **Crie seus domínios** na pasta `domain/`
6. **Implemente suas rotas** seguindo o padrão existente:
   - Crie o schema Zod em `domain/`
   - Crie o repo em `src/`
   - Crie o service em `src/`
   - Crie o controller em `src/`
   - Crie as rotas em `src/`
   - Registre as rotas no `src/index.ts`

## 📝 Exemplo de Uso

### Criando uma nova rota protegida

```typescript
// domain/product/product.schema.ts
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

// src/product/product.routes.ts
import { Router } from "express";
import { requireRole } from "../middlewares/auth";
import { validateSchema } from "../middlewares/validate-schema";
import { createProductSchema } from "../../domain/product/product.schema";
import { productController } from "./product.controller";

const productRoutes = Router();

productRoutes.post(
  "/",
  requireRole("Admin"),
  validateSchema({ body: createProductSchema }),
  productController.create
);

export { productRoutes };
```

## 🔧 Personalizações Comuns

- **JWT Secret**: Altere a variável `JWT_SECRET` no `.env` e no middleware `auth.ts`
- **Porta do servidor**: Altere no `src/index.ts`
- **Configurações do banco**: Ajuste em `src/db.ts` e `knexfile.ts`

## 📚 Recursos Adicionais

- Documentação do [Express.js](https://expressjs.com/)
- Documentação do [Kysely](https://kysely.dev/)
- Documentação do [Zod](https://zod.dev/)
- Documentação do [Knex](https://knexjs.org/)

