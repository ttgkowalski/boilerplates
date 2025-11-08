# Stage 1: Build
FROM node:20-alpine AS builder

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN pnpm install --frozen-lockfile

# Copiar apenas arquivos necessários para build
COPY src ./src
COPY domain ./domain
COPY tsconfig.json ./

# Compilar TypeScript
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine AS production

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar apenas dependências de produção
RUN pnpm install --frozen-lockfile --prod

# Copiar arquivos compilados do stage de build
COPY --from=builder /app/dist ./dist

# Expor porta da aplicação
EXPOSE 3000

# Comando para executar a aplicação
CMD ["node", "dist/src/index.js"]

