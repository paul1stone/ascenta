# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is Ascenta

Ascenta is an AI-first HR workflow execution platform — not a chatbot, not a system of record. It collects structured inputs, enforces guardrails, generates standardized artifacts (e.g., written warnings, PIPs), requires human review, and produces audit trails. See `features.md` for the full product specification.

## Commands

This is a **pnpm monorepo** managed with Turborepo. Always use `pnpm` (or `npx pnpm` if not globally installed) to run commands from the repo root.

```bash
pnpm dev                              # Start all dev servers (platform :3051, marketing :3050)
pnpm dev --filter=@ascenta/platform   # Start only the platform app
pnpm dev --filter=@ascenta/marketing  # Start only the marketing site
pnpm build                            # Production build
pnpm lint                             # ESLint
pnpm test                             # Run tests (vitest run)
pnpm test:watch                       # Run tests in watch mode
pnpm db:seed                          # Seed employee data
pnpm db:seed-grow                     # Seed Grow performance data (goals, check-ins, notes)
```

CI runs lint, `tsc --noEmit`, and tests on PRs to main (`.github/workflows/ci.yml`).

## Environment Variables

Required: `MONGODB_URI` (MongoDB Atlas connection string).
At least one AI provider key: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`. RAG/embeddings require OpenAI. If only Anthropic is set, workflow tools work but semantic search is disabled.

Email & delivery: `RESEND_API_KEY` (Resend transactional email), `APP_URL` (public base URL for email links, defaults to `http://localhost:3000`), `CRON_SECRET` (Vercel cron authorization), `INTERNAL_DEMO_EMAIL` (demo notification recipient, defaults to `demos@ascenta.ai`).

**Env file locations:** `.env.local` must exist in both `apps/platform/` and `apps/marketing/` (Next.js loads env from the app directory, not the monorepo root). A root `.env.local` is also needed for scripts like `pnpm db:seed`. All `.env*` files are gitignored.

## Architecture

**Stack**: Next.js 16 (App Router, RSC, React Compiler enabled) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (new-york style) · Mongoose ODM · MongoDB Atlas · Vercel AI SDK · Resend (email) · Vitest

### Monorepo Layout

```
ascenta/
├── apps/
│   ├── platform/          # Product app (port 3051) — chat, dashboard, tracker, ack
│   └── marketing/         # Public marketing site (port 3050) — landing, pricing, docs, etc.
├── packages/
│   ├── ui/                # Shared shadcn/ui components, globals.css, hooks, utils
│   ├── db/                # Mongoose schemas, models, query helpers, MongoDB Atlas connection
│   ├── email/             # Resend singleton + email templates
│   ├── types/             # Shared TypeScript types
│   └── config/            # Shared tsconfig + PostCSS config
├── turbo.json
└── pnpm-workspace.yaml
```

### Platform App (`apps/platform/src/`)

- **`app/`** — Pages and API routes (App Router). `/[category]/[sub]` is the main dashboard page (dynamic route for all nav sections); `/chat` for the legacy chat UI; `/tracker` for the Kanban document pipeline; `/dashboard` for HR management overview; `/ack/[id]` for document acknowledgment (static HTML, no React).
- **`components/`** — `chat/` has chat interface, workflow block components, model selector, and tool selector; `grow/` has working document panel and forms (goal-creation, check-in, performance-note), status dashboard, and learn panel; `dashboard/` has stats, employee directory, activity, and pipeline components; `app-navbar.tsx` is the main nav; `notification-center.tsx` for alerts; `document-tracker.tsx` for the tracker view.
- **`lib/ai/`** — AI integration layer. `config.ts` defines models/providers (OpenAI, Anthropic, Ollama), `providers.ts` creates provider instances, `tools.ts` and `workflow-tools.ts` define corrective action tools, `grow-tools.ts` defines Grow performance tools (goal creation, check-in, performance note, working document updates), `prompts.ts` has system prompts with detailed field inference guidance.
- **`lib/rag/`** — Retrieval-Augmented Generation. `embeddings.ts` (OpenAI text-embedding-3-small, 1536 dims), `search.ts` (MongoDB Atlas Vector Search, 0.3 similarity threshold), `context.ts` (context assembly for prompts).
- **`lib/workflows/`** — Workflow engine. `engine.ts` orchestrates runs with in-memory registry synced to DB, `guardrails.ts` evaluates business rules as code (not AI), `artifacts.ts` generates documents from templates, `audit.ts` writes immutable audit events with SHA-256 hashing. `definitions/` contains workflow configs (written-warning, pip, investigation-summary, create-goal, run-check-in, add-performance-note).
- **`lib/constants/`** — `dashboard-nav.ts` defines the dashboard navigation structure, category metadata (with accent colors per section), page configs with contextual suggestions, and per-page tool definitions.
- **`lib/validations/`** — Zod schemas for Grow workflow forms (`goal.ts`, `check-in.ts`, `performance-note.ts`).
- **`lib/chat/`** — `chat-context.tsx` provides ChatContext with per-page message state, working document state management, and AI streaming.
- **`hooks/`** — React hooks (`use-mobile.ts`).

### Marketing App (`apps/marketing/src/`)

- **`app/`** — Public pages: landing (`/`), `/pricing`, `/product`, `/about`, `/docs`, `/book-demo`, `/contact`, `/customers`, `/learn-ai`, `/login`, `/security`, `/support`, `/privacy`, `/terms`.
- **`components/`** — Marketing-specific UI components (navbar, footer, icons, etc.).
- **`lib/validations/`** — Zod schemas for form validation (e.g., `demo-request.ts`).

### Shared Packages

- **`packages/ui/`** — shadcn/ui primitives (button, dialog, dropdown, tabs, etc.), `globals.css` with design tokens, `utils.ts` with `cn()` helper, hooks. Both apps import via `@ascenta/ui` and `@ascenta/ui/globals.css`.
- **`packages/db/`** — Database layer. `schema.ts` defines Mongoose models for conversations, documents, and embeddings. `workflow-schema.ts` defines workflow models with embedded sub-documents (intakeFields, guardrails, etc. are embedded in WorkflowDefinition). `employee-schema.ts` has Employee with embedded notes. `goal-schema.ts`, `checkin-schema.ts`, `performance-note-schema.ts` define Grow performance models. `goal-constants.ts` and `performance-note-constants.ts` export enum constants separately from schemas (to avoid client-side mongoose imports). `index.ts` exports `connectDB()` for Mongoose connection (uses `MONGODB_URI`). Query helpers in `conversations.ts`, `employees.ts`, `tracked-documents.ts`, `documents.ts`.
- **`packages/email/`** — Resend integration. `resend.ts` exports a lazy singleton. `templates/` has email templates for document delivery, reminders, and demo request flows.
- **`packages/types/`** — Shared TypeScript type definitions.
- **`packages/config/`** — Shared `tsconfig.json` base and PostCSS config.

### Conversational Workflow Flow (Critical Path)

The chat-driven workflow is the core product loop. Understanding this flow is essential:

1. **User requests action** → AI calls `getEmployeeInfo` tool → calls `startCorrectiveAction` with employee data
2. **Field collection** — `startCorrectiveAction` / `updateWorkflowField` tools return JSON wrapped in `[ASCENTA_FIELD_PROMPT]...[/ASCENTA_FIELD_PROMPT]` delimiters. AI must include these blocks verbatim in responses.
3. **Frontend parsing** — `components/chat/workflow-blocks.tsx` extracts JSON between delimiters and renders `FieldPromptBlock` (interactive button grid) or `FollowUpBlock` (email/script chooser).
4. **User selection** — Clicking a button sends a synthetic message: `[SELECT:runId:fieldKey:value]` or `[FOLLOW_UP:runId:type]`
5. **Workflow memory** — `getWorkflowStateSummary(runId)` injects `[WORKFLOW STATE]` block into system prompt listing collected vs still-needed fields, preventing re-asking. The `activeWorkflowRunId` is tracked by the frontend and sent with each request.
6. **Generation** — When all fields collected (`readyToGenerate: true`), `generateCorrectiveActionDocument` renders artifact from template + inputs, creates tracked document, returns markdown.
7. **Follow-up** — `generateWorkflowFollowUp` streams a custom email or in-person script via internal `streamText()` call, wrapped in `[ASCENTA_FOLLOW_UP]...[/ASCENTA_FOLLOW_UP]`.

### Grow Performance System (Working Document Pattern)

The Grow system uses a different pattern from corrective actions — a "working document" with a side-panel form:

1. **User requests action** → AI calls `getEmployeeInfo` → calls `startGoalCreation`, `startCheckIn`, or `startPerformanceNote` with **all fields pre-filled** (AI must infer values from context, not ask one-by-one)
2. **Working document block** — Tool returns JSON wrapped in `[ASCENTA_WORKING_DOC]...[/ASCENTA_WORKING_DOC]` with `action: "open_working_document"` and prefilled field values.
3. **Frontend parsing** — `do-tab-chat.tsx` detects the block, calls `openWorkingDocument()` on ChatContext, which opens a side-panel form (50/50 split with chat).
4. **Form components** — `components/grow/forms/` has `GoalCreationForm`, `CheckInForm`, `PerformanceNoteForm` using react-hook-form + Zod validation. Forms are pre-populated from AI-provided values.
5. **Chat-to-form sync** — User can ask the AI to change fields (e.g., "change time period to Q3"), which triggers `updateWorkingDocument` tool → returns `action: "update_working_document"` block → frontend patches the form.
6. **User submits** — User reviews and submits the form themselves. The AI does NOT submit for them.
7. **API routes** — `POST /api/grow/goals`, `/api/grow/check-ins`, `/api/grow/performance-notes` handle form submissions directly.

**Key difference from corrective actions**: Corrective actions collect fields one-at-a-time via `FieldPromptBlock` buttons. Grow workflows pre-fill ALL fields at once and open a form for review. The AI is instructed to infer aggressively and explain its reasoning.

**Tool selector** — Pages can define tools in `dashboard-nav.ts` (e.g., Grow/Performance has Create Goal, Run Check-in, Add Note). Pre-selecting a tool injects `[REQUIRED_TOOL]` into the system prompt to guarantee tool usage. A transient badge shows on assistant messages during streaming.

### Document Delivery Pipeline

Generated documents flow through a delivery lifecycle:

1. **Created** — Workflow generates artifact → `upsertTrackedDocumentForRun()` creates tracked document in "on_us_to_send" stage
2. **Sent** — `POST /api/tracked-documents/[id]/send` generates HMAC-SHA256 token (docId + RESEND_API_KEY as secret), sends delivery email via Resend with ack link, sets stage to "sent"
3. **Acknowledged** — Employee clicks `/ack/[id]?token={token}` (static HTML page), POST validates HMAC token, sets stage to "acknowledged"
4. **Reminders** — Vercel cron (`vercel.json`, daily 9 AM) calls `/api/cron/reminders` with `Bearer {CRON_SECRET}`. Finds docs stuck in "sent"/"in_review" >3 days, sends up to 3 reminder emails spaced 2+ days apart.

### Key API Routes (Platform)

- **`/api/chat`** — Main AI endpoint. POST streams responses with tool calling; GET retrieves history. Injects workflow memory into system prompt. Max 10 tool-call steps per turn (`stopWhen: stepCountIs(10)`). Context: max 20 messages, ~8000 tokens.
- **`/api/tracked-documents`** — Kanban pipeline CRUD (POST/PATCH/GET). Sub-routes: `[id]/send` (email delivery), `[id]/ack` (HMAC acknowledgment).
- **`/api/dashboard/*`** — `stats` (employee/document/workflow aggregates), `activity` (combined audit + document events), `attention` (priority-ranked alerts for stalled docs/workflows), `employees` (paginated search with dept/status filters), `employees/[id]` (detail with notes/docs).
- **`/api/notifications`** — Aggregates recent acknowledges, sends, workflow completions, and audit events into unified notification feed.
- **`/api/documents/upload`** — Parses PDF (pdf-parse), DOCX (mammoth), or TXT, then chunks and embeds for RAG knowledge base.
- **`/api/cron/reminders`** — Authorized via `CRON_SECRET`, sends document acknowledgment reminders.
- **`/api/grow/*`** — `goals` (POST create goal), `check-ins` (POST create check-in), `performance-notes` (POST create note), `status` (GET status dashboard data with goals/check-ins/notes per employee).
- **`/api/conversations`**, **`/api/documents`**, **`/api/search`**, **`/api/completion`** — Supporting endpoints.

### Key API Routes (Marketing)

- **`/api/demo-requests`** — Validates with Zod, inserts to DB, sends confirmation + internal notification emails.

### Database Schema (Mongoose + MongoDB Atlas)

12+ MongoDB collections. Schemas live in `packages/db/src/`:
- **Conversations** — Chat persistence with embedded `messages[]` array (tool calls and metadata stored as Mixed type).
- **Workflow system** — `workflowDefinitions` (embeds `intakeFields[]`, `guardrails[]`, `artifactTemplates[]`, `textLibraries[]`, `guidedActions[]`), `workflowRuns` (with immutable `inputsSnapshot`), `workflowOutputs`, `auditEvents` (with input/output SHA-256 hashes).
- **Employees** — `employees` with embedded `notes[]` (types: written_warning, verbal_warning, late_notice, pip, commendation, general).
- **Documents & Embeddings** — RAG knowledge base with MongoDB Atlas Vector Search (`$vectorSearch` aggregation, index name: `embedding_index`, 1536 dims, cosine similarity).
- **Tracked Documents** — Kanban pipeline state linked to workflow runs and employees. Includes delivery fields: `employeeEmail`, `sentAt`, `acknowledgedAt`, `ackToken` (HMAC), `reminderSentAt`, `reminderCount`.
- **Grow Performance** — `goals` (with owner ref to Employee, category/measurement/alignment enums, time periods), `checkins` (linked to goals, manager + employee sections), `performancenotes` (observation/coaching/recognition typed notes with follow-up actions).
- **Demo Requests** — `demoRequests` collection for lead capture.

All models use `toJSON`/`toObject` virtuals to expose `id` as `_id.toString()` for frontend compatibility. API routes call `await connectDB()` before any DB operations.

### Workflow Engine Internals

- **Registry pattern**: Workflow definitions live as code in `apps/platform/src/lib/workflows/definitions/`. `registerWorkflow()` adds to an in-memory Map; `syncWorkflowToDatabase()` upserts via `WorkflowDefinition.findOneAndUpdate()` with `$inc: { version: 1 }` (single operation replaces multi-table delete/insert). `registerAllWorkflows()` called at app init.
- **Guardrails are code, not AI**: `guardrails.ts` uses a DSL with operators (`equals`, `contains`, `in`, `not_empty`, `gte`, `lte`) and condition builders (`and()`, `or()`, `isEmpty()`, `isTrue()`). Severities: `hard_stop` (blocks), `warning` (flags), `escalation` (requires review).
- **Artifact templates**: `{{fieldKey}}` interpolation with dot notation (`{{employee.department}}`), date formatting (`{{incidentDate|date}}`), locked vs AI-generated sections. Each version tracked separately.
- **Audit trail**: Immutable event logging with SHA-256 hash chain on inputs/outputs. Every create, update, guardrail trigger, and artifact generation is logged.

### AI Provider Setup

Three providers: OpenAI (default: gpt-4o), Anthropic (default: claude-sonnet-4), and Ollama (local, e.g., qwen3:8b). Provider is auto-detected from model ID. Embeddings are OpenAI-only. Tool availability: full tools when OpenAI configured (includes RAG search), workflow-only tools otherwise. Configuration in `apps/platform/src/lib/ai/config.ts`, instances in `providers.ts`.

## Conventions

- **Path alias**: `@/*` maps to `./src/*` within each app.
- **Package imports**: Use `@ascenta/ui`, `@ascenta/db`, `@ascenta/email`, `@ascenta/types`. Sub-path exports: `@ascenta/db/workflow-schema`, `@ascenta/db/employees`, `@ascenta/ui/globals.css`, etc.
- **Formatting**: Double quotes, semicolons, trailing commas (ES5), 2-space indent, 100-char line width (Prettier).
- **Components**: shadcn/ui with Radix primitives and Lucide icons. Shared components live in `packages/ui/`. Use `cn()` from `@ascenta/ui` for class merging.
- **Validation**: Zod schemas for API input validation.
- **IDs**: MongoDB ObjectId (native `_id`). `toJSON` virtuals expose `id` as string. `nanoid` used for non-DB short IDs where needed.
- **Design tokens**: Deep Blue (#0c1e3d), Summit orange (#ff6b35), Glacier (#f8fafc). Section accent colors defined in `dashboard-nav.ts` per category (Plan=#6688bb, Attract=#aa8866, Launch=#bb6688, Grow=#44aa99, Care=#cc6677, Protect=#8888aa). Custom fonts: Montserrat (display), Inter (sans).
- **Tailwind v4**: Uses `@source "./components"` in `packages/ui/src/globals.css` to scan shared UI components (Tailwind v4 ignores `node_modules` by default). Without this, utility classes used only in shared packages won't be generated.
- **Client-side imports**: Never import from `@ascenta/db/*-schema` in client components — these files import mongoose which crashes client-side. Use `@ascenta/db/goal-constants` or `@ascenta/db/performance-note-constants` for enum constants on the client.
- **Email**: Resend with lazy singleton in `packages/email/`. Templates in `packages/email/src/templates/`. Email failures are caught and logged but don't block primary operations.
- **Testing**: Vitest with `@` alias support. `passWithNoTests: true` in config.
- **No auth layer**: No middleware, authentication, or route guards are currently configured. All routes are open.
