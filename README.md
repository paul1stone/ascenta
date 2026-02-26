# Ascenta

AI-first HR workflow execution platform. Collects structured inputs, enforces guardrails, generates standardized artifacts (written warnings, PIPs, etc.), requires human review, and produces audit trails.

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v10+ (`npm install -g pnpm`)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)

## Getting Started

```bash
# Install dependencies
pnpm install

# Create env files (Next.js loads from each app directory, not the monorepo root)
cp .env.example .env.local
cp .env.local apps/platform/.env.local
cp .env.local apps/marketing/.env.local
# Then fill in MONGODB_URI, OPENAI_API_KEY or ANTHROPIC_API_KEY, etc.

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

## MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Add your IP to the Network Access list (or use `0.0.0.0/0` for development)
4. Get your connection string from **Connect > Drivers** and add it to `.env.local`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ascenta?appName=Cluster0
```

5. **(For RAG/semantic search)** Create an Atlas Vector Search index named `embedding_index` on the `embeddings` collection:
   - Go to **Atlas Search** > **Create Search Index** > **JSON Editor**
   - Collection: `embeddings`
   - Index name: `embedding_index`
   - Definition:
   ```json
   {
     "fields": [{
       "type": "vector",
       "path": "embedding",
       "numDimensions": 1536,
       "similarity": "cosine"
     }]
   }
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
│   ├── db/              # Mongoose schemas, models, query helpers
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
pnpm db:seed          # Seed employee data
```

## Environment Variables

`.env.local` must exist in **three places** (Next.js loads env from each app's directory, not the monorepo root):
- `/` (root) — used by `pnpm db:seed` and turbo cache keys
- `apps/platform/` — used by the platform Next.js dev server
- `apps/marketing/` — used by the marketing Next.js dev server

Required variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `OPENAI_API_KEY` | One of these | OpenAI API key (needed for RAG/embeddings) |
| `ANTHROPIC_API_KEY` | One of these | Anthropic API key |
| `RESEND_API_KEY` | For email | Resend transactional email |
| `APP_URL` | No | Public base URL (defaults to `http://localhost:3000`) |
| `CRON_SECRET` | For cron | Vercel cron authorization |
| `INTERNAL_DEMO_EMAIL` | No | Demo notification recipient (defaults to `demos@ascenta.ai`) |

## Tech Stack

Next.js 16 (App Router, RSC, React Compiler) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Mongoose ODM · MongoDB Atlas · Vercel AI SDK · Resend · Vitest
