# Ascenta Monorepo Separation Design

## Goal
Split the single Next.js app into a Turborepo monorepo with two independent Next.js apps (marketing + platform) and shared packages.

## Target Structure

```
ascenta/
├── apps/
│   ├── marketing/              # Public-facing marketing site
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx           # Landing page
│   │   │   │   ├── pricing/
│   │   │   │   ├── product/
│   │   │   │   ├── about/
│   │   │   │   ├── book-demo/
│   │   │   │   ├── contact/
│   │   │   │   ├── customers/
│   │   │   │   ├── docs/
│   │   │   │   ├── learn-ai/
│   │   │   │   ├── login/
│   │   │   │   ├── support/
│   │   │   │   ├── terms/
│   │   │   │   ├── privacy/
│   │   │   │   ├── security/
│   │   │   │   └── api/
│   │   │   │       └── demo-requests/
│   │   │   ├── components/
│   │   │   │   ├── navbar.tsx
│   │   │   │   ├── footer.tsx
│   │   │   │   ├── hero.tsx
│   │   │   │   ├── cta.tsx
│   │   │   │   ├── compass-section.tsx
│   │   │   │   ├── compass-menu.tsx
│   │   │   │   ├── path-to-top.tsx
│   │   │   │   ├── expedition-leader.tsx
│   │   │   │   ├── page-header.tsx
│   │   │   │   ├── icons.tsx
│   │   │   │   └── book-demo/
│   │   │   │       └── demo-form.tsx
│   │   │   └── lib/
│   │   │       └── validations/
│   │   │           └── demo-request.ts
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── platform/               # Product application
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── chat/
│       │   │   ├── dashboard/
│       │   │   ├── tracker/
│       │   │   ├── tracker/[id]/
│       │   │   ├── ack/[id]/
│       │   │   ├── workflows/[slug]/
│       │   │   └── api/
│       │   │       ├── chat/
│       │   │       ├── conversations/
│       │   │       ├── completion/
│       │   │       ├── search/
│       │   │       ├── documents/
│       │   │       ├── tracked-documents/
│       │   │       ├── dashboard/
│       │   │       ├── notifications/
│       │   │       └── cron/
│       │   ├── components/
│       │   │   ├── app-navbar.tsx
│       │   │   ├── document-tracker.tsx
│       │   │   ├── notification-center.tsx
│       │   │   ├── chat/           # All chat components
│       │   │   └── dashboard/      # All dashboard components
│       │   └── lib/
│       │       ├── ai/             # AI config, providers, prompts, tools
│       │       ├── workflows/      # Workflow engine + definitions
│       │       ├── rag/            # RAG pipeline
│       │       ├── tracker-actions.ts
│       │       └── constants/
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── ui/                         # Shared UI components
│   │   ├── src/
│   │   │   ├── components/         # All shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── collapsible.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── navigation-menu.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── toggle.tsx
│   │   │   │   ├── toggle-group.tsx
│   │   │   │   └── tooltip.tsx
│   │   │   ├── utils.ts            # cn() helper
│   │   │   └── index.ts            # Barrel exports
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── db/                         # Database layer
│   │   ├── src/
│   │   │   ├── index.ts            # Connection + lazy init
│   │   │   ├── schema.ts           # Core schema
│   │   │   ├── employee-schema.ts
│   │   │   ├── workflow-schema.ts
│   │   │   ├── demo-requests-schema.ts
│   │   │   ├── conversations.ts
│   │   │   ├── messages.ts
│   │   │   ├── documents.ts
│   │   │   ├── tracked-documents.ts
│   │   │   └── employees.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── email/                      # Email service
│   │   ├── src/
│   │   │   ├── resend.ts
│   │   │   └── templates/
│   │   │       ├── demo-confirmation.ts
│   │   │       ├── demo-notification.ts
│   │   │       ├── document-delivery.tsx
│   │   │       └── document-reminder.tsx
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── types/                      # Shared TypeScript types
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── config/                     # Shared configs
│       ├── tailwind/
│       │   └── base.ts             # Shared Tailwind theme/colors
│       ├── typescript/
│       │   └── base.json           # Base tsconfig
│       └── package.json
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                    # Root workspace package.json
└── .env                            # Shared env vars (both apps read from root)
```

## Package Dependencies

```
apps/marketing  → packages/ui, packages/db, packages/email, packages/types, packages/config
apps/platform   → packages/ui, packages/db, packages/email, packages/types, packages/config
```

## Key Decisions

1. **Marketing login page** redirects to platform app URL after auth
2. **Marketing API routes**: Only `/api/demo-requests` (form submissions + email). All other API routes live in platform.
3. **Shared `.env`**: Both apps read from root `.env` via Turborepo's env passthrough
4. **Light refresh on marketing**: Clean up during move, not a full redesign
5. **No middleware** currently exists, so no middleware migration needed
6. **`/ack/[id]`** stays in platform since it's product functionality (document acknowledgment)

## Migration Strategy

1. Scaffold monorepo structure (turbo.json, pnpm-workspace, root package.json)
2. Create shared packages first (ui, db, email, types, config)
3. Create platform app by moving (app) route group + related code
4. Create marketing app by moving (marketing) route group + related code
5. Update all imports to use package references
6. Verify both apps build and run independently
7. Clean up old single-app structure
