# Ruby Dojo

Plataforma interativa de aprendizado de Ruby, com teoria estruturada e desafios
de código com feedback em tempo real.

## Sobre o projeto

O Ruby Dojo é uma aplicação full-stack que permite aprender Ruby do zero por
meio de módulos teóricos e desafios práticos. O usuário escreve código Ruby
diretamente no browser e recebe o resultado da execução dos testes.

## Funcionalidades

- **Aprender** — trilha de módulos com conteúdo em Markdown, navegação
  sequencial e desafios relacionados
- **Praticar** — lista de desafios filtrados por dificuldade (Iniciante,
  Intermediário, Avançado)
- **Editor de código** — CodeMirror 6 com syntax highlighting para Ruby e tema
  One Dark
- **Execução real de código** — submissões invocam uma AWS Lambda que roda
  Minitest e retorna resultados por teste
- **Soluções da comunidade** — visíveis após resolver o desafio
- **Ranking** — placar global com top 50, pódio para os 3 primeiros e destaque
  do usuário logado
- **Perfil** — estatísticas, progresso por módulo e histórico de submissões
- **Autenticação** — login com GitHub via NextAuth.js v5

## Stack

| Camada            | Tecnologia                           |
| ----------------- | ------------------------------------ |
| Framework         | Next.js 15 (App Router)              |
| Linguagem         | TypeScript                           |
| UI                | React 19 + Tailwind CSS v4           |
| Autenticação      | NextAuth.js v5 + GitHub OAuth        |
| ORM               | Prisma v7                            |
| Banco local       | SQLite (better-sqlite3)              |
| Banco em produção | Turso (libSQL)                       |
| Editor de código  | CodeMirror 6 (@uiw/react-codemirror) |
| Execução Ruby     | AWS Lambda (Minitest)                |
| CMS               | Notion API                           |

## Pré-requisitos

- Node.js 20+
- Uma OAuth App do GitHub
- Credenciais AWS com acesso à Lambda `ruby-dojo-solution-runner`
- Banco Turso (produção) ou SQLite local (desenvolvimento)

## Instalação

```bash
# Instalar dependências
npm install

# Gerar o client do Prisma
npx prisma generate

# Criar e migrar o banco local
npx prisma migrate dev

# Popular com dados iniciais
npm run db:seed
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```env
# Banco local (SQLite)
DATABASE_URL="file:./dev.db"

# NextAuth
AUTH_SECRET="<segredo-aleatorio>"
AUTH_GITHUB_ID="<github-client-id>"
AUTH_GITHUB_SECRET="<github-client-secret>"
AUTH_TRUST_HOST="true"
NEXTAUTH_URL="http://localhost:3000"

# Turso (produção)
TURSO_DATABASE_URL="libsql://<db>.<org>.turso.io"
TURSO_AUTH_TOKEN="<token>"

# Notion CMS
NOTION_TOKEN="<integration-token>"
NOTION_MODULES_DB_ID="<database-id>"
NOTION_CHALLENGES_DB_ID="<database-id>"

# AWS Lambda
AWS_ACCESS_KEY_ID="<access-key>"
AWS_SECRET_ACCESS_KEY="<secret>"
AWS_REGION="us-east-1"
```

## Scripts disponíveis

```bash
# Desenvolvimento
npm run dev          # servidor local em http://localhost:3000
npm run build        # build de produção
npm start            # inicia o servidor de produção
npm run lint         # lint

# Banco de dados
npm run db:reset     # reset + seed completo
npm run db:seed      # apenas seed (módulos e desafios)
npm run db:seed-users  # seed de usuários de teste

# Pipeline de conteúdo (Notion)
npm run notion:sync      # sincroniza módulos e desafios do Notion → banco
npm run notion:populate  # importa desafios em massa de uma página Notion
```

## Estrutura do projeto

```
app/           # Rotas e páginas (Next.js App Router)
  api/         # API routes (run-code, auth)
  learn/       # Módulos de aprendizado
  practice/    # Desafios de código
  profile/     # Perfil do usuário
  ranking/     # Placar global
components/    # Componentes React reutilizáveis
lib/           # Singleton do Prisma
prisma/        # Schema, migrações e seeds
scripts/       # Scripts de manutenção e sync com Notion
```

## Banco de dados

O projeto usa **SQLite** em desenvolvimento e **Turso** (libSQL) em produção. As
migrações ficam em `prisma/migrations/` e são gerenciadas pelo Prisma CLI.

Para migrar dados do banco local para o Turso em produção:

```bash
npx tsx scripts/migrate-to-prod.ts
```

## Deploy

A aplicação está preparada para deploy na **Vercel**. Certifique-se de
configurar todas as variáveis de ambiente no painel da Vercel antes de fazer o
deploy.
