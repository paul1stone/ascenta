# Ascenta

AI-first HR workflow execution platform. Collects structured inputs, enforces guardrails, generates standardized artifacts (written warnings, PIPs, etc.), requires human review, and produces audit trails.

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v10+ (`npm install -g pnpm`)

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Then fill in DATABASE_URL, OPENAI_API_KEY or ANTHROPIC_API_KEY, etc.

# Push database schema (first time)
pnpm db:push

# Seed employee data (optional)
pnpm db:seed

# Start all dev servers
pnpm dev
```

This starts:
- **Platform** (product app): http://localhost:3051
- **Marketing** (public site): http://localhost:3050

To run a single app:

```bash
pnpm dev --filter=@ascenta/platform
pnpm dev --filter=@ascenta/marketing
```

## Monorepo Structure

This is a **pnpm monorepo** managed with [Turborepo](https://turbo.build/).

```
ascenta/
├── apps/
│   ├── platform/        # Product app (Next.js 16, port 3051)
│   └── marketing/       # Public marketing site (Next.js 16, port 3050)
├── packages/
│   ├── ui/              # Shared shadcn/ui components + globals.css
│   ├── db/              # Drizzle ORM schemas, migrations, query helpers
│   ├── email/           # Resend integration + email templates
│   ├── types/           # Shared TypeScript types
│   └── config/          # Shared tsconfig + PostCSS config
├── turbo.json
└── pnpm-workspace.yaml
```

## Commands

All commands run from the monorepo root:

```bash
pnpm dev              # Start all dev servers
pnpm build            # Production build (all apps)
pnpm lint             # ESLint (all packages)
pnpm test             # Run tests (vitest)
pnpm test:watch       # Run tests in watch mode

# Database (runs in packages/db)
pnpm db:push          # Push schema changes to database
pnpm db:generate      # Generate a new migration
pnpm db:migrate       # Run pending migrations
pnpm db:studio        # Open Drizzle Studio (database GUI)
pnpm db:seed          # Seed employee data
```

## Environment Variables

Create a `.env` file at the repo root. Required variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `OPENAI_API_KEY` | One of these | OpenAI API key (needed for RAG/embeddings) |
| `ANTHROPIC_API_KEY` | One of these | Anthropic API key |
| `RESEND_API_KEY` | For email | Resend transactional email |
| `APP_URL` | No | Public base URL (defaults to `http://localhost:3000`) |
| `CRON_SECRET` | For cron | Vercel cron authorization |
| `INTERNAL_DEMO_EMAIL` | No | Demo notification recipient (defaults to `demos@ascenta.ai`) |

## Tech Stack

Next.js 16 (App Router, RSC, React Compiler) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Drizzle ORM · Neon serverless Postgres · Vercel AI SDK · Resend · Vitest
