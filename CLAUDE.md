# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is Ascenta

Ascenta is an AI-first HR workflow execution platform — not a chatbot, not a system of record. It collects structured inputs, enforces guardrails, generates standardized artifacts (e.g., written warnings, PIPs), requires human review, and produces audit trails. See `features.md` for the full product specification.

## Commands

This is a **pnpm monorepo** managed with Turborepo. Always use `pnpm` (or `npx pnpm` if not globally installed) to run commands.

```bash
pnpm dev                           # Start all dev servers
pnpm dev --filter=@ascenta/platform  # Start only the platform app (http://localhost:3051)
pnpm build                         # Production build
pnpm lint                          # ESLint
pnpm test                          # Run tests (vitest run)
pnpm test:watch                    # Run tests in watch mode
pnpm db:push                       # Push schema changes to database
pnpm db:generate                   # Generate a new migration
pnpm db:migrate                    # Run pending migrations
pnpm db:studio                     # Open Drizzle Studio (database GUI)
npm run db:seed          # Seed employee data (scripts/seed-employees.ts)
```

CI runs lint, `tsc --noEmit`, and tests on PRs to main (`.github/workflows/ci.yml`).

## Environment Variables

Required: `DATABASE_URL` (Neon Postgres connection string).
At least one AI provider key: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`. RAG/embeddings require OpenAI. If only Anthropic is set, workflow tools work but semantic search is disabled.

Email & delivery: `RESEND_API_KEY` (Resend transactional email), `APP_URL` (public base URL for email links, defaults to `http://localhost:3000`), `CRON_SECRET` (Vercel cron authorization), `INTERNAL_DEMO_EMAIL` (demo notification recipient, defaults to `demos@ascenta.ai`).

## Architecture

**Stack**: Next.js 16 (App Router, RSC, React Compiler enabled) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (new-york style) · Drizzle ORM · Neon serverless Postgres · Vercel AI SDK · Resend (email) · Vitest

### Source Layout (`src/`)

- **`app/`** — Pages and API routes (App Router). Marketing pages at root; `/chat` for the conversational workflow UI; `/tracker` for the Kanban document pipeline; `/dashboard` for HR management overview; `/ack/[id]` for document acknowledgment (static HTML, no React).
- **`components/`** — React components. `ui/` contains shadcn/ui primitives; `chat/` has chat interface and workflow block components; `dashboard/` has stats, employee directory, activity, and pipeline components; `compass-menu.tsx` is a D3-based radial nav menu.
- **`lib/ai/`** — AI integration layer. `config.ts` defines models/providers, `providers.ts` creates OpenAI/Anthropic instances, `tools.ts` and `workflow-tools.ts` define function-calling tools, `prompts.ts` has system prompts.
- **`lib/db/`** — Database layer. `schema.ts` re-exports all sub-schemas (`workflow-schema.ts`, `employee-schema.ts`, `demo-requests-schema.ts`). `index.ts` exports a lazy-initialized Neon connection via Proxy (only connects on first query). Query helpers in `conversations.ts`, `employees.ts`, `tracked-documents.ts`.
- **`lib/email/`** — Resend integration. `resend.ts` exports a lazy singleton. `templates/` has email templates for document delivery, reminders, and demo request flows.
- **`lib/rag/`** — Retrieval-Augmented Generation. `embeddings.ts` (OpenAI text-embedding-3-small, 1536 dims), `search.ts` (pgvector semantic search, 0.7 similarity threshold), `context.ts` (context assembly for prompts).
- **`lib/workflows/`** — Workflow engine. `engine.ts` orchestrates runs with in-memory registry synced to DB, `guardrails.ts` evaluates business rules as code (not AI), `artifacts.ts` generates documents from templates, `audit.ts` writes immutable audit events with SHA-256 hashing. `definitions/` contains workflow configs (written-warning, pip, investigation-summary).
- **`lib/constants/`** — `dashboard-nav.ts` defines the dashboard navigation structure and category metadata.
- **`lib/validations/`** — Zod schemas for form validation (e.g., `demo-request.ts`).
- **`hooks/`** — React hooks (`use-mobile.ts`).

### Conversational Workflow Flow (Critical Path)

The chat-driven workflow is the core product loop. Understanding this flow is essential:

1. **User requests action** → AI calls `getEmployeeInfo` tool → calls `startCorrectiveAction` with employee data
2. **Field collection** — `startCorrectiveAction` / `updateWorkflowField` tools return JSON wrapped in `[ASCENTA_FIELD_PROMPT]...[/ASCENTA_FIELD_PROMPT]` delimiters. AI must include these blocks verbatim in responses.
3. **Frontend parsing** — `components/chat/workflow-blocks.tsx` extracts JSON between delimiters and renders `FieldPromptBlock` (interactive button grid) or `FollowUpBlock` (email/script chooser).
4. **User selection** — Clicking a button sends a synthetic message: `[SELECT:runId:fieldKey:value]` or `[FOLLOW_UP:runId:type]`
5. **Workflow memory** — `getWorkflowStateSummary(runId)` injects `[WORKFLOW STATE]` block into system prompt listing collected vs still-needed fields, preventing re-asking. The `activeWorkflowRunId` is tracked by the frontend and sent with each request.
6. **Generation** — When all fields collected (`readyToGenerate: true`), `generateCorrectiveActionDocument` renders artifact from template + inputs, creates tracked document, returns markdown.
7. **Follow-up** — `generateWorkflowFollowUp` streams a custom email or in-person script via internal `streamText()` call, wrapped in `[ASCENTA_FOLLOW_UP]...[/ASCENTA_FOLLOW_UP]`.

### Document Delivery Pipeline

Generated documents flow through a delivery lifecycle:

1. **Created** — Workflow generates artifact → `upsertTrackedDocumentForRun()` creates tracked document in "on_us_to_send" stage
2. **Sent** — `POST /api/tracked-documents/[id]/send` generates HMAC-SHA256 token (docId + RESEND_API_KEY as secret), sends delivery email via Resend with ack link, sets stage to "sent"
3. **Acknowledged** — Employee clicks `/ack/[id]?token={token}` (static HTML page), POST validates HMAC token, sets stage to "acknowledged"
4. **Reminders** — Vercel cron (`vercel.json`, daily 9 AM) calls `/api/cron/reminders` with `Bearer {CRON_SECRET}`. Finds docs stuck in "sent"/"in_review" >3 days, sends up to 3 reminder emails spaced 2+ days apart.

### Key API Routes

- **`/api/chat`** — Main AI endpoint. POST streams responses with tool calling; GET retrieves history. Injects workflow memory into system prompt. Max 10 tool-call steps per turn (`stopWhen: stepCountIs(10)`). Context: max 20 messages, ~8000 tokens.
- **`/api/tracked-documents`** — Kanban pipeline CRUD (POST/PATCH/GET). Sub-routes: `[id]/send` (email delivery), `[id]/ack` (HMAC acknowledgment).
- **`/api/dashboard/*`** — `stats` (employee/document/workflow aggregates), `activity` (combined audit + document events), `attention` (priority-ranked alerts for stalled docs/workflows), `employees` (paginated search with dept/status filters), `employees/[id]` (detail with notes/docs).
- **`/api/notifications`** — Aggregates recent acknowledges, sends, workflow completions, and audit events into unified notification feed.
- **`/api/documents/upload`** — Parses PDF (pdf-parse), DOCX (mammoth), or TXT, then chunks and embeds for RAG knowledge base.
- **`/api/demo-requests`** — Validates with Zod, inserts to DB, sends confirmation + internal notification emails.
- **`/api/cron/reminders`** — Authorized via `CRON_SECRET`, sends document acknowledgment reminders.
- **`/api/conversations`**, **`/api/documents`**, **`/api/search`**, **`/api/completion`** — Supporting endpoints.

### Database Schema (Drizzle + Neon Postgres)

Schemas split across files in `lib/db/`:
- **Conversations & Messages** — Chat persistence with JSONB tool calls and metadata.
- **Workflow system** — `workflowDefinitions`, `intakeFields`, `guardrails`, `artifactTemplates`, `textLibraries`, `guidedActions`, `workflowRuns` (with immutable `inputsSnapshot`), `workflowOutputs`, `auditEvents` (with input/output SHA-256 hashes).
- **Employees** — `employees`, `employeeNotes` (types: written_warning, verbal_warning, late_notice, pip, commendation, general).
- **Documents & Embeddings** — RAG knowledge base with pgvector.
- **Tracked Documents** — Kanban pipeline state linked to workflow runs and employees. Includes delivery fields: `employeeEmail`, `sentAt`, `acknowledgedAt`, `ackToken` (HMAC), `reminderSentAt`, `reminderCount`.
- **Demo Requests** — `demo_requests` table for lead capture.

Migrations live in `drizzle/migrations/`. The Drizzle config points to `./src/lib/db/schema.ts` as the schema entrypoint.

### Workflow Engine Internals

- **Registry pattern**: Workflow definitions live as code in `lib/workflows/definitions/`. `registerWorkflow()` adds to an in-memory Map; `syncWorkflowToDatabase()` upserts to DB with version incrementing, clearing and re-inserting related records (fields, guardrails, templates, actions). `registerAllWorkflows()` called at app init.
- **Guardrails are code, not AI**: `guardrails.ts` uses a DSL with operators (`equals`, `contains`, `in`, `not_empty`, `gte`, `lte`) and condition builders (`and()`, `or()`, `isEmpty()`, `isTrue()`). Severities: `hard_stop` (blocks), `warning` (flags), `escalation` (requires review).
- **Artifact templates**: `{{fieldKey}}` interpolation with dot notation (`{{employee.department}}`), date formatting (`{{incidentDate|date}}`), locked vs AI-generated sections. Each version tracked separately.
- **Audit trail**: Immutable event logging with SHA-256 hash chain on inputs/outputs. Every create, update, guardrail trigger, and artifact generation is logged.

### AI Provider Setup

Dual-provider: OpenAI (default: gpt-4o) and Anthropic (default: claude-sonnet-4). Provider is auto-detected from model ID (`claude*` → Anthropic, `gpt*` → OpenAI). Embeddings are OpenAI-only. Tool availability is conditional on provider config. Configuration in `lib/ai/config.ts`, instances in `lib/ai/providers.ts`.

## Conventions

- **Path alias**: `@/*` maps to `./src/*`.
- **Formatting**: Double quotes, semicolons, trailing commas (ES5), 2-space indent, 100-char line width (Prettier).
- **Components**: shadcn/ui with Radix primitives and Lucide icons. Use `cn()` from `lib/utils` for class merging.
- **Validation**: Zod schemas for API input validation.
- **IDs**: `nanoid` for generating short unique identifiers.
- **Design tokens**: Deep Blue (#0c1e3d), Summit orange (#ff6b35), Glacier (#f8fafc). Custom fonts: Montserrat (display), Inter (sans).
- **Email**: Resend with lazy singleton in `lib/email/resend.ts`. Templates in `lib/email/templates/`. Email failures are caught and logged but don't block primary operations.
- **Testing**: Vitest with `@` alias support. `passWithNoTests: true` in config.
- **No auth layer**: No middleware, authentication, or route guards are currently configured. All routes are open.
