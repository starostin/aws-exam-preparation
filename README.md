# AWS Exam Preparation

A full-stack web application for preparing for the AWS Certified Solutions Architect – Associate (SAA-C03) exam. Features daily study plans, practice quizzes, mock exams, flashcards, progress tracking, and readiness scoring.

## Tech Stack

- **Frontend**: Next.js 15 (TypeScript) — runs on port `3000`
- **Backend**: NestJS (TypeScript) — runs on port `3001`
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Authentication**: Supabase Auth
- **Monorepo**: npm workspaces + Turborepo — all apps and packages live in a single repository. npm workspaces handle shared `node_modules` and cross-package dependencies (e.g. `@aws-exam-prep/types` is consumed by both `api` and `web` without publishing). Turborepo orchestrates the build pipeline: it caches task outputs, runs `build`, `lint`, `test`, and `type-check` in the correct dependency order, and runs `dev` for all apps in parallel with a single command from the root.

---

## Prerequisites

Make sure the following are installed on your machine before you begin:

| Tool | Minimum version | Check |
|------|----------------|-------|
| Node.js | 20.x | `node -v` |
| npm | 10.x | `npm -v` |

You will also need a **Supabase project**. Create one for free at [supabase.com](https://supabase.com).

---

## 1. Clone the repository

```bash
git clone <repository-url>
cd aws-exam-preparation
```

---

## 2. Install dependencies

From the root of the monorepo, install all dependencies for every app and package at once:

```bash
npm install
```

---

## 3. Configure environment variables

Each app needs its own `.env.local` file. Create them by following the steps below.

### 3.1 Backend (`apps/api/.env.local`)

Create the file:

```bash
cp apps/api/.env.local.example apps/api/.env.local
```

### 3.2 Frontend (`apps/web/.env.local`)

Create the file:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

**Where to find Supabase credentials:**

1. Open your project in the [Supabase dashboard](https://supabase.com/dashboard).
2. Go to **Project Settings → API**.
3. Copy the **Project URL**, **anon / public** key, and **service_role** key.
4. Go to **Project Settings → Database** to get the **Connection string**.

---

## 4. Run database migrations

With `DATABASE_URL` set in `apps/api/.env.local`, apply the schema to your Supabase database:

```bash
cd apps/api
npm run db:migrate
```

To generate new migration files after changing the schema:

```bash
npm run db:generate
```

To open the visual Drizzle Studio browser for your database:

```bash
npm run db:studio
```

Go back to the root when done:

```bash
cd ../..
```

---

## 5. Run the project locally

From the root of the monorepo, start both the frontend and backend together using Turborepo:

```bash
npm run dev
```

This starts:

| App | URL |
|-----|-----|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (NestJS) | http://localhost:3001 |
| Swagger API docs | http://localhost:3001/api |

To run a specific app in isolation:

```bash
# Frontend only
cd apps/web && npm run dev

# Backend only
cd apps/api && npm run dev
```

---

## 6. Other useful commands

All commands below should be run from the **repository root** unless noted otherwise.

```bash
# Type-check all packages
npm run type-check

# Lint all packages
npm run lint

# Run all tests
npm run test

# Format all files with Prettier
npm run format

# Check formatting without writing changes
npm run format:check

# Build everything for production
npm run build
```

---

## Project structure

```
.
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   ├── config/       # Shared ESLint, Prettier, and TypeScript configs
│   └── types/        # Shared TypeScript types (DTOs, API contracts)
├── docs/
│   └── tech/         # Detailed technical documentation
├── turbo.json        # Turborepo pipeline configuration
└── package.json      # Root workspace configuration
```

For detailed technical documentation on each part of the stack, see the [`docs/tech/`](docs/tech/) directory or the [TECH.md](TECH.md) index.
