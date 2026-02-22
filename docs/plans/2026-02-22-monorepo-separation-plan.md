# Monorepo Separation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split the single Ascenta Next.js app into a Turborepo monorepo with two independent Next.js apps (marketing + platform) and shared packages (ui, db, email, types, config).

**Architecture:** Turborepo monorepo with pnpm workspaces. Two Next.js 16 apps under `apps/` sharing code via internal packages under `packages/`. Marketing site is lightweight (landing pages, demo forms). Platform app is the full AI HR product (chat, dashboard, tracker, workflows).

**Tech Stack:** Next.js 16.1.4, React 19.2.3, Turborepo, pnpm workspaces, Tailwind CSS 4, Drizzle ORM, TypeScript 5

---

## Task 1: Scaffold Monorepo Root

**Files:**
- Create: `turbo.json`
- Create: `pnpm-workspace.yaml`
- Modify: `package.json` (root)

**Step 1: Install pnpm if not present**

Run: `npm install -g pnpm`

**Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Step 3: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "globalEnv": [
    "DATABASE_URL",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "RESEND_API_KEY"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    }
  }
}
```

**Step 4: Transform root `package.json` into workspace root**

Replace `package.json` with:

```json
{
  "name": "ascenta",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "dev:marketing": "turbo dev --filter=@ascenta/marketing",
    "dev:platform": "turbo dev --filter=@ascenta/platform",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "db:generate": "turbo db:generate --filter=@ascenta/db",
    "db:migrate": "turbo db:migrate --filter=@ascenta/db",
    "db:push": "turbo db:push --filter=@ascenta/db",
    "db:studio": "pnpm --filter @ascenta/db db:studio",
    "db:seed": "pnpm --filter @ascenta/db db:seed"
  },
  "devDependencies": {
    "turbo": "^2"
  },
  "packageManager": "pnpm@10.6.5"
}
```

**Step 5: Install turbo**

Run: `pnpm install`

**Step 6: Create directory structure**

Run:
```bash
mkdir -p apps/marketing apps/platform
mkdir -p packages/ui packages/db packages/email packages/types packages/config
```

**Step 7: Commit**

```bash
git add turbo.json pnpm-workspace.yaml package.json
git commit -m "chore: scaffold turborepo monorepo root"
```

---

## Task 2: Create `packages/config` (Shared Configs)

**Files:**
- Create: `packages/config/package.json`
- Create: `packages/config/tsconfig/base.json`
- Create: `packages/config/tsconfig/nextjs.json`
- Create: `packages/config/postcss.mjs`

**Step 1: Create `packages/config/package.json`**

```json
{
  "name": "@ascenta/config",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./postcss": "./postcss.mjs",
    "./tsconfig/base": "./tsconfig/base.json",
    "./tsconfig/nextjs": "./tsconfig/nextjs.json"
  }
}
```

**Step 2: Create `packages/config/tsconfig/base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true
  },
  "exclude": ["node_modules"]
}
```

**Step 3: Create `packages/config/tsconfig/nextjs.json`**

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ]
}
```

**Step 4: Create `packages/config/postcss.mjs`**

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

**Step 5: Commit**

```bash
git add packages/config/
git commit -m "chore: add shared config package (tsconfig, postcss)"
```

---

## Task 3: Create `packages/types` (Shared Types)

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Create: `packages/types/src/index.ts`

**Step 1: Create `packages/types/package.json`**

```json
{
  "name": "@ascenta/types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

**Step 2: Create `packages/types/tsconfig.json`**

```json
{
  "extends": "@ascenta/config/tsconfig/base",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create `packages/types/src/index.ts`**

Copy contents from `src/lib/types.ts`:

```typescript
/** Lightweight conversation summary used in sidebar and chat page lists */
export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}
```

**Step 4: Commit**

```bash
git add packages/types/
git commit -m "chore: add shared types package"
```

---

## Task 4: Create `packages/ui` (Shared UI Components)

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/globals.css`
- Create: `packages/ui/src/utils.ts`
- Create: `packages/ui/src/index.ts`
- Move: all `src/components/ui/*.tsx` -> `packages/ui/src/components/`

**Step 1: Create `packages/ui/package.json`**

```json
{
  "name": "@ascenta/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./globals.css": "./src/globals.css",
    "./*": "./src/components/*.tsx"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.562.0",
    "tailwind-merge": "^3.4.0"
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "@ascenta/config": "workspace:*",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

**Step 2: Create `packages/ui/tsconfig.json`**

```json
{
  "extends": "@ascenta/config/tsconfig/base",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create `packages/ui/src/utils.ts`**

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 4: Create `packages/ui/src/globals.css`**

Copy the full contents of `src/app/globals.css` (all CSS variables, themes, custom fonts, utility classes). This becomes the single source of truth for the design system.

**Step 5: Move all UI components**

```bash
mkdir -p packages/ui/src/components
cp src/components/ui/*.tsx packages/ui/src/components/
```

**Step 6: Fix imports in all moved UI components**

In every file under `packages/ui/src/components/`, replace:
- `import { cn } from "@/lib/utils"` -> `import { cn } from "../utils"`

**Step 7: Create `packages/ui/src/index.ts`**

```typescript
export { cn } from "./utils";
export * from "./components/accordion";
export * from "./components/avatar";
export * from "./components/badge";
export * from "./components/button";
export * from "./components/card";
export * from "./components/collapsible";
export * from "./components/dropdown-menu";
export * from "./components/input";
export * from "./components/label";
export * from "./components/navigation-menu";
export * from "./components/popover";
export * from "./components/scroll-area";
export * from "./components/separator";
export * from "./components/sheet";
export * from "./components/sidebar";
export * from "./components/skeleton";
export * from "./components/tabs";
export * from "./components/toggle";
export * from "./components/toggle-group";
export * from "./components/tooltip";
```

**Step 8: Commit**

```bash
git add packages/ui/
git commit -m "chore: add shared UI package with all shadcn components"
```

---

## Task 5: Create `packages/db` (Database Layer)

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/src/index.ts`
- Move: all `src/lib/db/*.ts` -> `packages/db/src/`
- Move: `drizzle.config.ts` -> `packages/db/drizzle.config.ts`
- Move: `drizzle/` -> `packages/db/drizzle/`
- Move: `scripts/seed-employees.ts` -> `packages/db/scripts/seed-employees.ts`
- Move: `scripts/mark-initial-migration-applied.ts` -> `packages/db/scripts/mark-initial-migration-applied.ts`

**Step 1: Create `packages/db/package.json`**

```json
{
  "name": "@ascenta/db",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema.ts",
    "./employee-schema": "./src/employee-schema.ts",
    "./workflow-schema": "./src/workflow-schema.ts",
    "./demo-requests-schema": "./src/demo-requests-schema.ts",
    "./conversations": "./src/conversations.ts",
    "./documents": "./src/documents.ts",
    "./tracked-documents": "./src/tracked-documents.ts",
    "./employees": "./src/employees.ts"
  },
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "npx tsx scripts/seed-employees.ts"
  },
  "dependencies": {
    "@neondatabase/serverless": "^1.0.2",
    "dotenv": "^17.2.3",
    "drizzle-orm": "^0.45.1"
  },
  "devDependencies": {
    "@ascenta/config": "workspace:*",
    "drizzle-kit": "^0.31.8",
    "tsx": "^4",
    "typescript": "^5"
  }
}
```

**Step 2: Create `packages/db/tsconfig.json`**

```json
{
  "extends": "@ascenta/config/tsconfig/base",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Move database files**

```bash
cp src/lib/db/*.ts packages/db/src/
cp drizzle.config.ts packages/db/
cp -r drizzle/ packages/db/drizzle/
cp -r scripts/ packages/db/scripts/
```

**Step 4: Fix internal imports in packages/db/src/**

In all `packages/db/src/*.ts` files, replace:
- `import { db } from "@/lib/db"` -> `import { db } from "./index"`
- `import * as schema from "./schema"` stays the same (relative already)
- Any `@/lib/db/...` -> relative `./...`

**Step 5: Fix drizzle.config.ts path**

Update schema path in `packages/db/drizzle.config.ts`:
```typescript
schema: "./src/schema.ts",
out: "./drizzle/migrations",
```

**Step 6: Commit**

```bash
git add packages/db/
git commit -m "chore: add shared database package"
```

---

## Task 6: Create `packages/email` (Email Service)

**Files:**
- Create: `packages/email/package.json`
- Create: `packages/email/tsconfig.json`
- Create: `packages/email/src/index.ts`
- Move: `src/lib/email/resend.ts` -> `packages/email/src/resend.ts`
- Move: `src/lib/email/templates/` -> `packages/email/src/templates/`

**Step 1: Create `packages/email/package.json`**

```json
{
  "name": "@ascenta/email",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./templates/*": "./src/templates/*.ts"
  },
  "dependencies": {
    "resend": "^6.9.2"
  },
  "peerDependencies": {
    "react": "^19"
  },
  "devDependencies": {
    "@ascenta/config": "workspace:*",
    "typescript": "^5"
  }
}
```

**Step 2: Create `packages/email/tsconfig.json`**

```json
{
  "extends": "@ascenta/config/tsconfig/base",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Move email files**

```bash
cp src/lib/email/resend.ts packages/email/src/resend.ts
cp -r src/lib/email/templates/ packages/email/src/templates/
```

**Step 4: Create `packages/email/src/index.ts`**

```typescript
export { resend } from "./resend";
```

**Step 5: Fix any internal imports in email templates**

Templates should only import from `resend` or each other. Update any `@/lib/email/...` references to relative paths.

**Step 6: Commit**

```bash
git add packages/email/
git commit -m "chore: add shared email package"
```

---

## Task 7: Create `apps/platform` (Product App)

**Files:**
- Create: `apps/platform/package.json`
- Create: `apps/platform/tsconfig.json`
- Create: `apps/platform/next.config.ts`
- Create: `apps/platform/postcss.config.mjs`
- Move: `src/app/(app)/*` -> `apps/platform/src/app/` (flatten route group)
- Move: `src/app/ack/` -> `apps/platform/src/app/ack/`
- Move: `src/app/workflows/` -> `apps/platform/src/app/workflows/`
- Move: `src/app/api/` (most routes) -> `apps/platform/src/app/api/`
- Move: platform components -> `apps/platform/src/components/`
- Move: platform lib -> `apps/platform/src/lib/`
- Create: `apps/platform/src/app/layout.tsx`
- Create: `apps/platform/src/app/globals.css`

**Step 1: Create `apps/platform/package.json`**

```json
{
  "name": "@ascenta/platform",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@ascenta/db": "workspace:*",
    "@ascenta/email": "workspace:*",
    "@ascenta/types": "workspace:*",
    "@ascenta/ui": "workspace:*",
    "@ai-sdk/anthropic": "^3.0.23",
    "@ai-sdk/openai": "^3.0.18",
    "@vercel/analytics": "^1.6.1",
    "ai": "^6.0.49",
    "d3": "^7.9.0",
    "lucide-react": "^0.562.0",
    "mammoth": "^1.11.0",
    "next": "16.1.4",
    "pdf-parse": "^2.4.5",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-markdown": "^10.1.0",
    "remark-gfm": "^4.0.1",
    "shiki": "^3.21.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@ascenta/config": "workspace:*",
    "@tailwindcss/postcss": "^4",
    "@tailwindcss/typography": "^0.5.19",
    "@types/d3": "^7.4.3",
    "@types/node": "^20",
    "@types/pdf-parse": "^1.1.5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-plugin-react-compiler": "1.0.0",
    "eslint": "^9",
    "eslint-config-next": "16.1.4",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5",
    "vitest": "^4.0.18"
  }
}
```

**Step 2: Create `apps/platform/tsconfig.json`**

```json
{
  "extends": "@ascenta/config/tsconfig/nextjs",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ]
}
```

**Step 3: Create `apps/platform/next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@ascenta/ui", "@ascenta/db", "@ascenta/email", "@ascenta/types"],
};

export default nextConfig;
```

**Step 4: Create `apps/platform/postcss.config.mjs`**

```javascript
import config from "@ascenta/config/postcss";
export default config;
```

**Step 5: Create `apps/platform/src/app/globals.css`**

```css
@import "@ascenta/ui/globals.css";
```

**Step 6: Create `apps/platform/src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SidebarProvider } from "@ascenta/ui/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascenta Platform",
  description: "AI-powered HR workflows for peak performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          {children}
        </SidebarProvider>
        <Analytics />
      </body>
    </html>
  );
}
```

**Step 7: Move app pages (flatten route group)**

```bash
# Pages - flatten (app) group since this IS the app now
cp -r src/app/\(app\)/chat apps/platform/src/app/chat
cp -r src/app/\(app\)/dashboard apps/platform/src/app/dashboard
cp -r src/app/\(app\)/tracker apps/platform/src/app/tracker

# Special routes
cp -r src/app/ack apps/platform/src/app/ack
# Only copy workflows if it exists
[ -d src/app/workflows ] && cp -r src/app/workflows apps/platform/src/app/workflows
```

**Step 8: Move platform API routes**

```bash
mkdir -p apps/platform/src/app/api
cp -r src/app/api/chat apps/platform/src/app/api/chat
cp -r src/app/api/conversations apps/platform/src/app/api/conversations
cp -r src/app/api/completion apps/platform/src/app/api/completion
cp -r src/app/api/search apps/platform/src/app/api/search
cp -r src/app/api/documents apps/platform/src/app/api/documents
cp -r src/app/api/tracked-documents apps/platform/src/app/api/tracked-documents
cp -r src/app/api/dashboard apps/platform/src/app/api/dashboard
cp -r src/app/api/notifications apps/platform/src/app/api/notifications
cp -r src/app/api/cron apps/platform/src/app/api/cron
```

**Step 9: Move platform components**

```bash
mkdir -p apps/platform/src/components
cp src/components/app-navbar.tsx apps/platform/src/components/
cp src/components/document-tracker.tsx apps/platform/src/components/
cp src/components/notification-center.tsx apps/platform/src/components/
cp -r src/components/chat/ apps/platform/src/components/chat/
cp -r src/components/dashboard/ apps/platform/src/components/dashboard/
```

**Step 10: Move platform lib code**

```bash
mkdir -p apps/platform/src/lib
cp -r src/lib/ai/ apps/platform/src/lib/ai/
cp -r src/lib/workflows/ apps/platform/src/lib/workflows/
cp -r src/lib/rag/ apps/platform/src/lib/rag/
cp src/lib/tracker-actions.ts apps/platform/src/lib/
cp -r src/lib/constants/ apps/platform/src/lib/constants/
```

**Step 11: Update imports throughout `apps/platform/`**

This is the biggest sub-step. In ALL files under `apps/platform/src/`:

| Old import | New import |
|---|---|
| `from "@/components/ui/..."` | `from "@ascenta/ui/..."` or `from "@ascenta/ui"` |
| `from "@/lib/utils"` (for `cn`) | `from "@ascenta/ui"` |
| `from "@/lib/db"` or `from "@/lib/db/..."` | `from "@ascenta/db"` or `from "@ascenta/db/..."` |
| `from "@/lib/email/..."` | `from "@ascenta/email"` or `from "@ascenta/email/templates/..."` |
| `from "@/lib/types"` (for shared types) | `from "@ascenta/types"` |
| `from "@/components/..."` (platform components) | Keep as `from "@/components/..."` (local) |
| `from "@/lib/ai/..."` | Keep as `from "@/lib/ai/..."` (local) |
| `from "@/lib/workflows/..."` | Keep as `from "@/lib/workflows/..."` (local) |
| `from "@/lib/rag/..."` | Keep as `from "@/lib/rag/..."` (local) |

**Step 12: Commit**

```bash
git add apps/platform/
git commit -m "feat: create platform app with all product pages and API routes"
```

---

## Task 8: Create `apps/marketing` (Marketing Site)

**Files:**
- Create: `apps/marketing/package.json`
- Create: `apps/marketing/tsconfig.json`
- Create: `apps/marketing/next.config.ts`
- Create: `apps/marketing/postcss.config.mjs`
- Move: `src/app/(marketing)/*` -> `apps/marketing/src/app/` (flatten route group)
- Move: marketing components -> `apps/marketing/src/components/`
- Move: marketing lib -> `apps/marketing/src/lib/`
- Create: `apps/marketing/src/app/layout.tsx`
- Create: `apps/marketing/src/app/globals.css`

**Step 1: Create `apps/marketing/package.json`**

```json
{
  "name": "@ascenta/marketing",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start --port 3000",
    "lint": "eslint"
  },
  "dependencies": {
    "@ascenta/db": "workspace:*",
    "@ascenta/email": "workspace:*",
    "@ascenta/ui": "workspace:*",
    "@hookform/resolvers": "^5.2.2",
    "@vercel/analytics": "^1.6.1",
    "lucide-react": "^0.562.0",
    "next": "16.1.4",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.71.1",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@ascenta/config": "workspace:*",
    "@tailwindcss/postcss": "^4",
    "@tailwindcss/typography": "^0.5.19",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-plugin-react-compiler": "1.0.0",
    "eslint": "^9",
    "eslint-config-next": "16.1.4",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5"
  }
}
```

**Step 2: Create `apps/marketing/tsconfig.json`**

```json
{
  "extends": "@ascenta/config/tsconfig/nextjs",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ]
}
```

**Step 3: Create `apps/marketing/next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@ascenta/ui", "@ascenta/db", "@ascenta/email"],
};

export default nextConfig;
```

**Step 4: Create `apps/marketing/postcss.config.mjs`**

```javascript
import config from "@ascenta/config/postcss";
export default config;
```

**Step 5: Create `apps/marketing/src/app/globals.css`**

```css
@import "@ascenta/ui/globals.css";
```

**Step 6: Create `apps/marketing/src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascenta | AI-Powered HR Workflows",
  description: "AI-powered HR workflows that bring clarity, safety, and peak performance to every organizational peak.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
```

**Step 7: Move marketing pages (flatten route group)**

```bash
mkdir -p apps/marketing/src/app

# Copy all marketing pages
cp src/app/\(marketing\)/page.tsx apps/marketing/src/app/page.tsx
cp -r src/app/\(marketing\)/pricing apps/marketing/src/app/pricing
cp -r src/app/\(marketing\)/product apps/marketing/src/app/product
cp -r src/app/\(marketing\)/about apps/marketing/src/app/about
cp -r src/app/\(marketing\)/book-demo apps/marketing/src/app/book-demo
cp -r src/app/\(marketing\)/contact apps/marketing/src/app/contact
cp -r src/app/\(marketing\)/customers apps/marketing/src/app/customers
cp -r src/app/\(marketing\)/docs apps/marketing/src/app/docs
cp -r src/app/\(marketing\)/learn-ai apps/marketing/src/app/learn-ai
cp -r src/app/\(marketing\)/login apps/marketing/src/app/login
cp -r src/app/\(marketing\)/support apps/marketing/src/app/support
cp -r src/app/\(marketing\)/terms apps/marketing/src/app/terms
cp -r src/app/\(marketing\)/privacy apps/marketing/src/app/privacy
cp -r src/app/\(marketing\)/security apps/marketing/src/app/security
```

**Step 8: Move marketing API route**

```bash
mkdir -p apps/marketing/src/app/api
cp -r src/app/api/demo-requests apps/marketing/src/app/api/demo-requests
```

**Step 9: Move marketing components**

```bash
mkdir -p apps/marketing/src/components
cp src/components/navbar.tsx apps/marketing/src/components/
cp src/components/footer.tsx apps/marketing/src/components/
cp src/components/hero.tsx apps/marketing/src/components/
cp src/components/cta.tsx apps/marketing/src/components/
cp src/components/compass-section.tsx apps/marketing/src/components/
cp src/components/compass-menu.tsx apps/marketing/src/components/
cp src/components/path-to-top.tsx apps/marketing/src/components/
cp src/components/expedition-leader.tsx apps/marketing/src/components/
cp src/components/page-header.tsx apps/marketing/src/components/
cp src/components/icons.tsx apps/marketing/src/components/
cp -r src/components/book-demo/ apps/marketing/src/components/book-demo/
```

**Step 10: Move marketing lib code**

```bash
mkdir -p apps/marketing/src/lib/validations
cp src/lib/validations/demo-request.ts apps/marketing/src/lib/validations/
```

**Step 11: Update imports throughout `apps/marketing/`**

In ALL files under `apps/marketing/src/`:

| Old import | New import |
|---|---|
| `from "@/components/ui/..."` | `from "@ascenta/ui/..."` or `from "@ascenta/ui"` |
| `from "@/lib/utils"` (for `cn`) | `from "@ascenta/ui"` |
| `from "@/lib/db/..."` | `from "@ascenta/db/..."` |
| `from "@/lib/email/..."` | `from "@ascenta/email"` or `from "@ascenta/email/templates/..."` |
| `from "@/components/..."` (marketing components) | Keep as `from "@/components/..."` (local) |

**Step 12: Update login page redirect**

In `apps/marketing/src/app/login/page.tsx`, the login redirect should point to the platform app URL (e.g., `http://localhost:3001/chat` in dev, or the production platform URL).

**Step 13: Commit**

```bash
git add apps/marketing/
git commit -m "feat: create marketing app with all landing pages"
```

---

## Task 9: Update All Package Imports (Systematic Sweep)

**Purpose:** Ensure every file in both apps uses package imports correctly.

**Step 1: Sweep `apps/platform/` for broken imports**

Search all `.ts` and `.tsx` files for any remaining `@/components/ui/` or `@/lib/db` or `@/lib/email` or `@/lib/utils` imports and fix them.

Run: `grep -rn '"@/components/ui/' apps/platform/src/`
Run: `grep -rn '"@/lib/db' apps/platform/src/`
Run: `grep -rn '"@/lib/email' apps/platform/src/`
Run: `grep -rn '"@/lib/utils' apps/platform/src/`
Run: `grep -rn '"@/lib/types' apps/platform/src/`

Fix each match according to the import mapping in Task 7.

**Step 2: Sweep `apps/marketing/` for broken imports**

Run: `grep -rn '"@/components/ui/' apps/marketing/src/`
Run: `grep -rn '"@/lib/db' apps/marketing/src/`
Run: `grep -rn '"@/lib/email' apps/marketing/src/`
Run: `grep -rn '"@/lib/utils' apps/marketing/src/`

Fix each match according to the import mapping in Task 8.

**Step 3: Sweep `packages/db/` for broken imports**

Run: `grep -rn '"@/' packages/db/src/`

All `@/` imports in db package should be converted to relative imports.

**Step 4: Sweep `packages/email/` for broken imports**

Run: `grep -rn '"@/' packages/email/src/`

Fix any remaining `@/` imports.

**Step 5: Commit**

```bash
git add -A
git commit -m "fix: update all imports to use monorepo packages"
```

---

## Task 10: Install Dependencies and Verify Build

**Step 1: Install all dependencies**

Run from project root:
```bash
pnpm install
```

Verify: no errors, `pnpm-lock.yaml` is generated.

**Step 2: Build packages first**

No build step needed for internal packages (they use raw TypeScript exports consumed by Next.js transpilePackages).

**Step 3: Build marketing app**

Run: `pnpm --filter @ascenta/marketing build`

Expected: Clean build with no errors. Fix any import issues that arise.

**Step 4: Build platform app**

Run: `pnpm --filter @ascenta/platform build`

Expected: Clean build with no errors. Fix any import issues that arise.

**Step 5: Test both apps run in dev mode**

Run: `pnpm dev`

Verify:
- Marketing runs on `http://localhost:3000`
- Platform runs on `http://localhost:3001`

**Step 6: Commit lock file**

```bash
git add pnpm-lock.yaml
git commit -m "chore: add pnpm lockfile"
```

---

## Task 11: Clean Up Old Single-App Structure

**Step 1: Remove old source files**

After verifying both apps build and run, remove the old single-app source:

```bash
# Remove old app directory
rm -rf src/

# Remove old config files
rm -f postcss.config.mjs
rm -f drizzle.config.ts
rm -f next.config.ts

# Remove old drizzle migrations (now in packages/db/)
rm -rf drizzle/

# Remove old scripts (now in packages/db/)
rm -rf scripts/

# Remove old package-lock.json if exists
rm -f package-lock.json

# Remove old node_modules
rm -rf node_modules/
```

**Step 2: Update `.gitignore` if needed**

Ensure `.gitignore` covers:
```
node_modules/
.next/
.turbo/
dist/
```

**Step 3: Fresh install and verify**

```bash
pnpm install
pnpm build
```

**Step 4: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove old single-app structure, monorepo migration complete"
```

---

## Task 12: Smoke Test Both Apps

**Step 1: Start both apps**

Run: `pnpm dev`

**Step 2: Test marketing site (port 3000)**

Navigate to each page and verify it renders:
- `http://localhost:3000` - Landing page
- `http://localhost:3000/pricing` - Pricing
- `http://localhost:3000/product` - Product
- `http://localhost:3000/about` - About
- `http://localhost:3000/book-demo` - Demo form
- `http://localhost:3000/contact` - Contact
- `http://localhost:3000/login` - Login

**Step 3: Test platform app (port 3001)**

Navigate to each page and verify it renders:
- `http://localhost:3001/chat` - Chat interface
- `http://localhost:3001/dashboard` - Dashboard
- `http://localhost:3001/tracker` - Document tracker

**Step 4: Test demo form submission**

Submit the demo form on marketing site and verify it processes correctly.

**Step 5: Test chat functionality**

Send a message in the chat interface and verify AI responses stream correctly.

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: monorepo separation complete and verified"
```

---

## Dependency Graph

```
Task 1  (Scaffold root)
  ├── Task 2  (packages/config)
  │     ├── Task 3  (packages/types)
  │     ├── Task 4  (packages/ui)
  │     ├── Task 5  (packages/db)
  │     └── Task 6  (packages/email)
  │           ├── Task 7  (apps/platform)  -- depends on all packages
  │           └── Task 8  (apps/marketing) -- depends on all packages
  │                 └── Task 9  (import sweep) -- depends on both apps
  │                       └── Task 10 (build verify) -- depends on import sweep
  │                             └── Task 11 (cleanup) -- depends on build verify
  │                                   └── Task 12 (smoke test)
```

**Parallelizable tasks:**
- Tasks 3, 4, 5, 6 can run in parallel (all depend only on Task 2)
- Tasks 7 and 8 can run in parallel (both depend on Tasks 3-6)
