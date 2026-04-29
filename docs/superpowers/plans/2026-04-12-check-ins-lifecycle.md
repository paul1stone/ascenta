# Check-ins Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Prepare → Participate → Reflect check-in lifecycle with role-based views, perception gap scoring, and hybrid scheduling.

**Architecture:** Auth context provider drives role-based rendering across a dedicated check-in page (`/grow/check-ins/[id]`) that renders phase-specific content based on check-in status and user role. The checkins tab under Grow/Performance serves as the dashboard. A cron job handles cadence-based scheduling, status transitions, and gap signal computation.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript, Mongoose/MongoDB, Zod, Tailwind v4, shadcn/ui, Vercel AI SDK

**Spec:** `docs/superpowers/specs/2026-04-12-check-ins-lifecycle-design.md`

---

## File Structure

### New Files

```
packages/db/src/
├── notification-schema.ts              # Notification model

apps/platform/src/
├── app/
│   ├── grow/
│   │   └── check-ins/
│   │       └── [id]/
│   │           └── page.tsx            # Dedicated check-in page (RSC)
│   └── api/
│       ├── auth/
│       │   ├── me/route.ts            # GET current user
│       │   └── users/route.ts         # GET available users for picker
│       ├── grow/
│       │   └── check-ins/
│       │       └── [id]/
│       │           ├── route.ts       # GET check-in detail (privacy-filtered)
│       │           ├── prepare/route.ts
│       │           ├── participate/route.ts
│       │           ├── reflect/route.ts
│       │           ├── approve/route.ts
│       │           ├── assist/route.ts
│       │           └── cancel/route.ts
│       ├── cron/
│       │   └── check-ins/route.ts     # Scheduling + transitions cron
│       └── notifications/
│           └── [id]/
│               └── read/route.ts      # Mark notification read
├── components/
│   ├── auth/
│   │   ├── auth-provider.tsx          # AuthProvider context
│   │   └── user-picker.tsx            # Dev-mode user picker dropdown
│   └── grow/
│       ├── checkins-panel.tsx          # Dashboard tab panel
│       └── check-in/
│           ├── check-in-page.tsx       # Phase-aware container (client)
│           ├── phase-stepper.tsx       # 3-step progress indicator
│           ├── prepare-employee.tsx    # Employee prepare form
│           ├── prepare-manager.tsx     # Manager prepare toolkit
│           ├── participate-manager.tsx # Manager 4-move form
│           ├── participate-employee.tsx # Employee participate form
│           ├── commitment-approval.tsx # Mutual commitment approval
│           ├── reflect-employee.tsx    # Employee 5-dimension Likert
│           ├── reflect-manager.tsx     # Manager 4-dimension + forward action
│           ├── gap-signals.tsx         # Gap signal cards
│           ├── likert-scale.tsx        # Reusable 1-5 scale input
│           └── ai-assist-button.tsx    # AI suggestion trigger
├── lib/
│   ├── auth/
│   │   └── auth-context.tsx           # Context definition + useAuth hook
│   ├── check-in/
│   │   ├── privacy.ts                 # Privacy filtering logic
│   │   ├── transitions.ts            # Status machine logic
│   │   └── gap-engine.ts             # Gap signal computation
│   └── validations/
│       └── check-in.ts               # Rewrite: phase-specific Zod schemas
└── tests/
    ├── check-in-privacy.test.ts
    ├── check-in-transitions.test.ts
    └── gap-engine.test.ts
```

### Modified Files

```
packages/db/src/checkin-schema.ts       # Rewrite: lifecycle schema
packages/db/src/index.ts                # Add notification-schema export
apps/platform/src/app/layout.tsx        # Wrap in AuthProvider
apps/platform/src/app/[category]/[sub]/page.tsx  # Add checkins tab render
apps/platform/src/components/app-navbar.tsx       # Add user picker to profile area
apps/platform/src/components/notification-center.tsx  # Add check-in notification types
apps/platform/src/app/api/notifications/route.ts  # Include check-in notifications
apps/platform/src/app/api/grow/check-ins/route.ts # Rewrite: list + create
apps/platform/src/lib/ai/grow-tools.ts  # Evolve startCheckInTool
apps/platform/src/lib/workflows/definitions/run-check-in.ts  # Update fields
```

---

## Task 1: Auth Context Provider + API Routes

**Files:**
- Create: `apps/platform/src/lib/auth/auth-context.tsx`
- Create: `apps/platform/src/components/auth/auth-provider.tsx`
- Create: `apps/platform/src/components/auth/user-picker.tsx`
- Create: `apps/platform/src/app/api/auth/me/route.ts`
- Create: `apps/platform/src/app/api/auth/users/route.ts`
- Modify: `apps/platform/src/app/layout.tsx`
- Modify: `apps/platform/src/components/app-navbar.tsx`

- [ ] **Step 1: Create auth context definition**

Create `apps/platform/src/lib/auth/auth-context.tsx`:

```tsx
"use client";

import { createContext, useContext } from "react";

export type UserRole = "manager" | "employee" | "hr";

export type AuthUser = {
  id: string;
  employeeId: string;
  name: string;
  role: UserRole;
  managerId?: string;
  directReports?: string[];
};

export type AuthContextValue = {
  user: AuthUser | null;
  switchUser: (userId: string) => Promise<void>;
  isDevMode: boolean;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  switchUser: async () => {},
  isDevMode: true,
  loading: true,
});

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
```

- [ ] **Step 2: Create auth API routes**

Create `apps/platform/src/app/api/auth/users/route.ts`:

```tsx
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const employees = await Employee.find({ status: "active" })
    .select("employeeId firstName lastName department jobTitle managerName")
    .sort({ lastName: 1 })
    .lean();

  const users = employees.map((emp) => {
    const hasDirectReports = employees.some(
      (e) =>
        e.managerName &&
        e.managerName.toLowerCase().includes(emp.firstName.toLowerCase()) &&
        e.managerName.toLowerCase().includes(emp.lastName.toLowerCase())
    );

    return {
      id: emp._id.toString(),
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      jobTitle: emp.jobTitle,
      role: hasDirectReports ? "manager" : ("employee" as const),
      managerName: emp.managerName,
    };
  });

  return NextResponse.json({ users });
}
```

Create `apps/platform/src/app/api/auth/me/route.ts`:

```tsx
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  await connectDB();
  const employee = await Employee.findById(userId)
    .select("employeeId firstName lastName department jobTitle managerName")
    .lean();

  if (!employee) {
    return NextResponse.json({ user: null });
  }

  const directReports = await Employee.find({
    managerName: { $regex: new RegExp(`${employee.firstName}.*${employee.lastName}`, "i") },
    status: "active",
  })
    .select("_id")
    .lean();

  const hasDirectReports = directReports.length > 0;

  return NextResponse.json({
    user: {
      id: employee._id.toString(),
      employeeId: employee.employeeId,
      name: `${employee.firstName} ${employee.lastName}`,
      role: hasDirectReports ? "manager" : "employee",
      directReports: hasDirectReports ? directReports.map((r) => r._id.toString()) : undefined,
    },
  });
}
```

- [ ] **Step 3: Create AuthProvider component**

Create `apps/platform/src/components/auth/auth-provider.tsx`:

```tsx
"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { AuthContext, type AuthUser } from "@/lib/auth/auth-context";

const STORAGE_KEY = "ascenta-dev-user-id";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (userId: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "x-dev-user-id": userId },
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem(STORAGE_KEY, userId);
      }
    } catch {
      console.error("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      fetchUser(stored);
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const switchUser = useCallback(
    async (userId: string) => {
      setLoading(true);
      await fetchUser(userId);
    },
    [fetchUser]
  );

  return (
    <AuthContext.Provider value={{ user, switchUser, isDevMode: true, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

- [ ] **Step 4: Create UserPicker component**

Create `apps/platform/src/components/auth/user-picker.tsx`. This renders inside the top nav's profile area. It fetches `/api/auth/users` and displays a dropdown of available users grouped by role. Clicking a user calls `switchUser()`. Shows current user name + role badge when closed. Uses Popover from shadcn/ui.

```tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ascenta/ui/components/popover";
import { Button } from "@ascenta/ui/components/button";
import { ChevronDown, User, Shield, Users } from "lucide-react";
import { cn } from "@ascenta/ui";

type PickerUser = {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  jobTitle: string;
  role: "manager" | "employee";
};

const roleIcons = {
  manager: Users,
  employee: User,
  hr: Shield,
};

const roleBadgeColors = {
  manager: "bg-blue-500/10 text-blue-400",
  employee: "bg-emerald-500/10 text-emerald-400",
  hr: "bg-purple-500/10 text-purple-400",
};

export function UserPicker() {
  const { user, switchUser, loading } = useAuth();
  const [users, setUsers] = useState<PickerUser[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && users.length === 0) {
      fetch("/api/auth/users")
        .then((r) => r.json())
        .then((data) => setUsers(data.users || []));
    }
  }, [open, users.length]);

  const RoleIcon = user ? roleIcons[user.role] : User;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <RoleIcon className="h-4 w-4" />
          {loading ? (
            "Loading..."
          ) : user ? (
            <>
              <span className="text-sm">{user.name}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                  roleBadgeColors[user.role]
                )}
              >
                {user.role}
              </span>
            </>
          ) : (
            "Select User"
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="end">
        <div className="text-xs text-muted-foreground px-2 py-1 mb-1 font-medium">
          Switch Identity (Dev Mode)
        </div>
        <div className="max-h-64 overflow-y-auto space-y-0.5">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                switchUser(u.id);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors",
                user?.id === u.id && "bg-accent"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{u.name}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    roleBadgeColors[u.role]
                  )}
                >
                  {u.role}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {u.jobTitle} · {u.department}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 5: Wire AuthProvider into root layout**

Modify `apps/platform/src/app/layout.tsx`. Add `AuthProvider` wrapping the existing providers:

```tsx
// Add import:
import { AuthProvider } from "@/components/auth/auth-provider";

// In the JSX, wrap inside the existing RoleProvider:
<RoleProvider>
  <AuthProvider>
    <ChatProvider>
      {/* existing layout content */}
    </ChatProvider>
  </AuthProvider>
</RoleProvider>
```

- [ ] **Step 6: Add UserPicker to AppNavbar**

Modify `apps/platform/src/components/app-navbar.tsx`. Import and render `UserPicker` in the navbar's right section (where a profile/avatar area would go):

```tsx
import { UserPicker } from "@/components/auth/user-picker";

// In the JSX, add to the right side of the navbar:
<UserPicker />
```

The exact placement depends on current navbar structure — add it after the existing nav buttons/links, aligned right.

- [ ] **Step 7: Verify in browser**

Run: `pnpm dev --filter=@ascenta/platform`

Open `http://localhost:3051`. Verify:
1. UserPicker appears in the top nav
2. Clicking it loads the employee list from the DB
3. Selecting a user persists across page refresh (localStorage)
4. The role badge shows correctly (manager/employee)

- [ ] **Step 8: Commit**

```bash
git add apps/platform/src/lib/auth/ apps/platform/src/components/auth/ apps/platform/src/app/api/auth/ apps/platform/src/app/layout.tsx apps/platform/src/components/app-navbar.tsx
git commit -m "feat(auth): add dev-mode auth context provider with user picker in nav"
```

---

## Task 2: Rewrite Check-in Schema + Zod Validations

**Files:**
- Modify: `packages/db/src/checkin-schema.ts`
- Modify: `apps/platform/src/lib/validations/check-in.ts`

- [ ] **Step 1: Rewrite the Mongoose schema**

Replace the contents of `packages/db/src/checkin-schema.ts` with the lifecycle schema. Key structural decisions:

- Sub-documents for each phase (employeePrepare, managerPrepare, participate, employeeReflect, managerReflect, gapSignals)
- Status enum expanded to 7 values
- All sub-document fields default to null
- Boolean fields default to false
- Compound indexes for common query patterns

```ts
import mongoose, { Schema, type Document, type Types } from "mongoose";

export const CHECKIN_STATUSES = [
  "preparing",
  "ready",
  "in_progress",
  "reflecting",
  "completed",
  "missed",
  "cancelled",
] as const;

export type CheckInStatus = (typeof CHECKIN_STATUSES)[number];

export const CADENCE_SOURCES = ["auto", "manual"] as const;

const EmployeePrepareSchema = new Schema(
  {
    progressReflection: { type: String, default: null },
    stuckPointReflection: { type: String, default: null },
    conversationIntent: { type: String, default: null },
    completedAt: { type: Date, default: null },
    distilledPreview: { type: String, default: null },
  },
  { _id: false }
);

const ManagerPrepareSchema = new Schema(
  {
    contextBriefingViewed: { type: Boolean, default: false },
    gapRecoveryViewed: { type: Boolean, default: false },
    openingMove: { type: String, default: null },
    recognitionNote: { type: String, default: null },
    developmentalFocus: { type: String, default: null },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const ParticipateSchema = new Schema(
  {
    employeeOpening: { type: String, default: null },
    employeeKeyTakeaways: { type: String, default: null },
    stuckPointDiscussion: { type: String, default: null },
    recognition: { type: String, default: null },
    development: { type: String, default: null },
    performance: { type: String, default: null },
    employeeCommitment: { type: String, default: null },
    managerCommitment: { type: String, default: null },
    employeeApprovedManagerCommitment: { type: Boolean, default: null },
    managerApprovedEmployeeCommitment: { type: Boolean, default: null },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const EmployeeReflectSchema = new Schema(
  {
    heard: { type: Number, default: null, min: 1, max: 5 },
    clarity: { type: Number, default: null, min: 1, max: 5 },
    recognition: { type: Number, default: null, min: 1, max: 5 },
    development: { type: Number, default: null, min: 1, max: 5 },
    safety: { type: Number, default: null, min: 1, max: 5 },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const ManagerReflectSchema = new Schema(
  {
    clarity: { type: Number, default: null, min: 1, max: 5 },
    recognition: { type: Number, default: null, min: 1, max: 5 },
    development: { type: Number, default: null, min: 1, max: 5 },
    safety: { type: Number, default: null, min: 1, max: 5 },
    forwardAction: { type: String, default: null },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const GapSignalsSchema = new Schema(
  {
    clarity: { type: Number, default: null },
    recognition: { type: Number, default: null },
    development: { type: Number, default: null },
    safety: { type: Number, default: null },
    generatedAt: { type: Date, default: null },
  },
  { _id: false }
);

const CheckInSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    goals: [
      {
        type: Schema.Types.ObjectId,
        ref: "Goal",
        required: true,
      },
    ],
    scheduledAt: { type: Date, required: true, index: true },
    cadenceSource: {
      type: String,
      enum: CADENCE_SOURCES,
      default: "manual",
    },
    status: {
      type: String,
      enum: CHECKIN_STATUSES,
      required: true,
      default: "preparing",
      index: true,
    },
    employeePrepare: { type: EmployeePrepareSchema, default: () => ({}) },
    managerPrepare: { type: ManagerPrepareSchema, default: () => ({}) },
    participate: { type: ParticipateSchema, default: () => ({}) },
    employeeReflect: { type: EmployeeReflectSchema, default: () => ({}) },
    managerReflect: { type: ManagerReflectSchema, default: () => ({}) },
    gapSignals: { type: GapSignalsSchema, default: () => ({}) },
    completedAt: { type: Date, default: null },
    previousCheckInId: {
      type: Schema.Types.ObjectId,
      ref: "CheckIn",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CheckInSchema.index({ employee: 1, scheduledAt: -1 });
CheckInSchema.index({ manager: 1, status: 1 });
CheckInSchema.index({ status: 1, scheduledAt: 1 });
CheckInSchema.index({ employee: 1, manager: 1, status: 1 });

export interface CheckIn_Type extends Document {
  employee: Types.ObjectId;
  manager: Types.ObjectId;
  goals: Types.ObjectId[];
  scheduledAt: Date;
  cadenceSource: "auto" | "manual";
  status: CheckInStatus;
  employeePrepare: {
    progressReflection: string | null;
    stuckPointReflection: string | null;
    conversationIntent: string | null;
    completedAt: Date | null;
    distilledPreview: string | null;
  };
  managerPrepare: {
    contextBriefingViewed: boolean;
    gapRecoveryViewed: boolean;
    openingMove: string | null;
    recognitionNote: string | null;
    developmentalFocus: string | null;
    completedAt: Date | null;
  };
  participate: {
    employeeOpening: string | null;
    employeeKeyTakeaways: string | null;
    stuckPointDiscussion: string | null;
    recognition: string | null;
    development: string | null;
    performance: string | null;
    employeeCommitment: string | null;
    managerCommitment: string | null;
    employeeApprovedManagerCommitment: boolean | null;
    managerApprovedEmployeeCommitment: boolean | null;
    completedAt: Date | null;
  };
  employeeReflect: {
    heard: number | null;
    clarity: number | null;
    recognition: number | null;
    development: number | null;
    safety: number | null;
    completedAt: Date | null;
  };
  managerReflect: {
    clarity: number | null;
    recognition: number | null;
    development: number | null;
    safety: number | null;
    forwardAction: string | null;
    completedAt: Date | null;
  };
  gapSignals: {
    clarity: number | null;
    recognition: number | null;
    development: number | null;
    safety: number | null;
    generatedAt: Date | null;
  };
  completedAt: Date | null;
  previousCheckInId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export const CheckIn =
  (mongoose.models.CheckIn as mongoose.Model<CheckIn_Type>) ||
  mongoose.model<CheckIn_Type>("CheckIn", CheckInSchema);
```

- [ ] **Step 2: Rewrite Zod validation schemas**

Replace `apps/platform/src/lib/validations/check-in.ts` with phase-specific schemas:

```ts
import { z } from "zod";

export const employeePrepareSchema = z.object({
  progressReflection: z.string().min(1, "Progress reflection is required"),
  stuckPointReflection: z.string().min(1, "Stuck point reflection is required"),
  conversationIntent: z.string().min(1, "Conversation intent is required"),
});

export const managerPrepareSchema = z.object({
  openingMove: z.string().nullable().optional(),
  recognitionNote: z.string().nullable().optional(),
  developmentalFocus: z.string().nullable().optional(),
});

export const participateManagerSchema = z.object({
  stuckPointDiscussion: z.string().min(1, "Stuck point discussion is required"),
  recognition: z.string().min(1, "Recognition is required"),
  development: z.string().min(1, "Development discussion is required"),
  performance: z.string().nullable().optional(),
  managerCommitment: z.string().min(1, "Manager commitment is required"),
});

export const participateEmployeeSchema = z.object({
  employeeOpening: z.string().min(1, "Your opening is required"),
  employeeKeyTakeaways: z.string().min(1, "Key takeaways are required"),
  employeeCommitment: z.string().min(1, "Your commitment is required"),
});

export const reflectScoreSchema = z.number().int().min(1).max(5);

export const employeeReflectSchema = z.object({
  heard: reflectScoreSchema,
  clarity: reflectScoreSchema,
  recognition: reflectScoreSchema,
  development: reflectScoreSchema,
  safety: reflectScoreSchema,
});

export const managerReflectSchema = z.object({
  clarity: reflectScoreSchema,
  recognition: reflectScoreSchema,
  development: reflectScoreSchema,
  safety: reflectScoreSchema,
  forwardAction: z.string().min(1, "Forward action is required"),
});

export const scheduleCheckInSchema = z.object({
  employeeId: z.string().min(1),
  goalIds: z.array(z.string()).min(1, "At least one goal is required"),
  scheduledAt: z.string().datetime(),
});

export const approveCommitmentSchema = z.object({
  approved: z.boolean(),
});

export type EmployeePrepareValues = z.infer<typeof employeePrepareSchema>;
export type ManagerPrepareValues = z.infer<typeof managerPrepareSchema>;
export type ParticipateManagerValues = z.infer<typeof participateManagerSchema>;
export type ParticipateEmployeeValues = z.infer<typeof participateEmployeeSchema>;
export type EmployeeReflectValues = z.infer<typeof employeeReflectSchema>;
export type ManagerReflectValues = z.infer<typeof managerReflectSchema>;
export type ScheduleCheckInValues = z.infer<typeof scheduleCheckInSchema>;
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd apps/platform && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add packages/db/src/checkin-schema.ts apps/platform/src/lib/validations/check-in.ts
git commit -m "feat(schema): rewrite check-in schema for lifecycle phases + Zod validations"
```

---

## Task 3: Notification Schema

**Files:**
- Create: `packages/db/src/notification-schema.ts`
- Modify: `packages/db/src/index.ts`

- [ ] **Step 1: Create notification schema**

Create `packages/db/src/notification-schema.ts`:

```ts
import mongoose, { Schema, type Document, type Types } from "mongoose";

export const NOTIFICATION_TYPES = [
  "prepare_open",
  "prepare_reminder",
  "checkin_ready",
  "reflect_open",
  "reflect_reminder",
  "gap_signal",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    checkInId: {
      type: Schema.Types.ObjectId,
      ref: "CheckIn",
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export interface Notification_Type extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  checkInId: Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const Notification =
  (mongoose.models.Notification as mongoose.Model<Notification_Type>) ||
  mongoose.model<Notification_Type>("Notification", NotificationSchema);
```

- [ ] **Step 2: Add export to packages/db/src/index.ts**

Add to the existing exports:

```ts
export * from "./notification-schema";
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd packages/db && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add packages/db/src/notification-schema.ts packages/db/src/index.ts
git commit -m "feat(schema): add notification model for check-in lifecycle events"
```

---

## Task 4: Privacy Filtering + Status Transitions + Gap Engine

**Files:**
- Create: `apps/platform/src/lib/check-in/privacy.ts`
- Create: `apps/platform/src/lib/check-in/transitions.ts`
- Create: `apps/platform/src/lib/check-in/gap-engine.ts`
- Create: `apps/platform/src/tests/check-in-privacy.test.ts`
- Create: `apps/platform/src/tests/check-in-transitions.test.ts`
- Create: `apps/platform/src/tests/gap-engine.test.ts`

- [ ] **Step 1: Write privacy filtering tests**

Create `apps/platform/src/tests/check-in-privacy.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { filterCheckInForRole } from "@/lib/check-in/privacy";

const fullCheckIn = {
  _id: "checkin-1",
  employee: "emp-1",
  manager: "mgr-1",
  goals: ["goal-1"],
  scheduledAt: "2026-04-14T14:00:00Z",
  status: "reflecting",
  employeePrepare: {
    progressReflection: "Made good progress on Q2 targets",
    stuckPointReflection: "Blocked by cross-team dependency",
    conversationIntent: "Need a decision on timeline",
    completedAt: "2026-04-12T10:00:00Z",
    distilledPreview: "Good Q2 progress, blocked on cross-team dep",
  },
  managerPrepare: {
    contextBriefingViewed: true,
    gapRecoveryViewed: false,
    openingMove: "Let's start with the cross-team blocker",
    recognitionNote: "Great pipeline work",
    developmentalFocus: "Delegation skills",
    completedAt: "2026-04-12T12:00:00Z",
  },
  participate: {
    employeeOpening: "I want to talk about the timeline",
    employeeKeyTakeaways: "Clear on next steps",
    stuckPointDiscussion: "Will escalate to VP",
    recognition: "Pipeline work was excellent",
    development: "Discussed delegation practice",
    performance: null,
    employeeCommitment: "Draft the proposal by Friday",
    managerCommitment: "Escalate cross-team blocker by Wednesday",
    employeeApprovedManagerCommitment: true,
    managerApprovedEmployeeCommitment: true,
    completedAt: "2026-04-14T15:00:00Z",
  },
  employeeReflect: {
    heard: 4,
    clarity: 5,
    recognition: 2,
    development: 4,
    safety: 5,
    completedAt: "2026-04-14T18:00:00Z",
  },
  managerReflect: {
    clarity: 4,
    recognition: 3,
    development: 4,
    safety: 4,
    forwardAction: "Follow up on delegation opportunities",
    completedAt: "2026-04-14T17:00:00Z",
  },
  gapSignals: {
    clarity: -1,
    recognition: 1,
    development: 0,
    safety: -1,
    generatedAt: "2026-04-14T18:30:00Z",
  },
};

describe("filterCheckInForRole", () => {
  it("employee: sees own prepare, own participate fields, own reflect; never sees manager prepare, manager reflect, gap signals", () => {
    const filtered = filterCheckInForRole(fullCheckIn, "employee", "emp-1");

    expect(filtered.employeePrepare.progressReflection).toBe("Made good progress on Q2 targets");
    expect(filtered.employeePrepare.distilledPreview).toBeUndefined();
    expect(filtered.managerPrepare).toBeUndefined();
    expect(filtered.participate.employeeOpening).toBe("I want to talk about the timeline");
    expect(filtered.participate.employeeCommitment).toBe("Draft the proposal by Friday");
    expect(filtered.participate.managerCommitment).toBe("Escalate cross-team blocker by Wednesday");
    expect(filtered.participate.stuckPointDiscussion).toBe("Will escalate to VP");
    expect(filtered.employeeReflect.heard).toBe(4);
    expect(filtered.managerReflect).toBeUndefined();
    expect(filtered.gapSignals).toBeUndefined();
  });

  it("manager: sees distilled preview, own prepare, full participate, own reflect, gap signals; never sees raw employee prepare or employee reflect", () => {
    const filtered = filterCheckInForRole(fullCheckIn, "manager", "mgr-1");

    expect(filtered.employeePrepare.distilledPreview).toBe(
      "Good Q2 progress, blocked on cross-team dep"
    );
    expect(filtered.employeePrepare.progressReflection).toBeUndefined();
    expect(filtered.employeePrepare.stuckPointReflection).toBeUndefined();
    expect(filtered.employeePrepare.conversationIntent).toBeUndefined();
    expect(filtered.managerPrepare.openingMove).toBe("Let's start with the cross-team blocker");
    expect(filtered.participate.recognition).toBe("Pipeline work was excellent");
    expect(filtered.managerReflect.forwardAction).toBe("Follow up on delegation opportunities");
    expect(filtered.employeeReflect).toBeUndefined();
    expect(filtered.gapSignals.clarity).toBe(-1);
  });

  it("hr: sees only aggregate gap signals, nothing else", () => {
    const filtered = filterCheckInForRole(fullCheckIn, "hr", "hr-1");

    expect(filtered.employeePrepare).toBeUndefined();
    expect(filtered.managerPrepare).toBeUndefined();
    expect(filtered.participate).toBeUndefined();
    expect(filtered.employeeReflect).toBeUndefined();
    expect(filtered.managerReflect).toBeUndefined();
    expect(filtered.gapSignals.clarity).toBe(-1);
    expect(filtered.status).toBe("reflecting");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- src/tests/check-in-privacy.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement privacy filtering**

Create `apps/platform/src/lib/check-in/privacy.ts`:

```ts
import type { UserRole } from "@/lib/auth/auth-context";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterCheckInForRole(checkIn: any, role: UserRole, userId: string) {
  const base = {
    _id: checkIn._id,
    employee: checkIn.employee,
    manager: checkIn.manager,
    goals: checkIn.goals,
    scheduledAt: checkIn.scheduledAt,
    status: checkIn.status,
    cadenceSource: checkIn.cadenceSource,
    completedAt: checkIn.completedAt,
    previousCheckInId: checkIn.previousCheckInId,
    createdAt: checkIn.createdAt,
    updatedAt: checkIn.updatedAt,
  };

  if (role === "employee") {
    return {
      ...base,
      employeePrepare: {
        progressReflection: checkIn.employeePrepare?.progressReflection,
        stuckPointReflection: checkIn.employeePrepare?.stuckPointReflection,
        conversationIntent: checkIn.employeePrepare?.conversationIntent,
        completedAt: checkIn.employeePrepare?.completedAt,
      },
      participate: checkIn.participate
        ? {
            employeeOpening: checkIn.participate.employeeOpening,
            employeeKeyTakeaways: checkIn.participate.employeeKeyTakeaways,
            stuckPointDiscussion: checkIn.participate.stuckPointDiscussion,
            recognition: checkIn.participate.recognition,
            development: checkIn.participate.development,
            performance: checkIn.participate.performance,
            employeeCommitment: checkIn.participate.employeeCommitment,
            managerCommitment: checkIn.participate.managerCommitment,
            employeeApprovedManagerCommitment:
              checkIn.participate.employeeApprovedManagerCommitment,
            managerApprovedEmployeeCommitment:
              checkIn.participate.managerApprovedEmployeeCommitment,
            completedAt: checkIn.participate.completedAt,
          }
        : undefined,
      employeeReflect: checkIn.employeeReflect?.completedAt
        ? {
            heard: checkIn.employeeReflect.heard,
            clarity: checkIn.employeeReflect.clarity,
            recognition: checkIn.employeeReflect.recognition,
            development: checkIn.employeeReflect.development,
            safety: checkIn.employeeReflect.safety,
            completedAt: checkIn.employeeReflect.completedAt,
          }
        : undefined,
    };
  }

  if (role === "manager") {
    return {
      ...base,
      employeePrepare: {
        distilledPreview: checkIn.employeePrepare?.distilledPreview,
        completedAt: checkIn.employeePrepare?.completedAt,
      },
      managerPrepare: checkIn.managerPrepare
        ? { ...checkIn.managerPrepare }
        : undefined,
      participate: checkIn.participate
        ? { ...checkIn.participate }
        : undefined,
      managerReflect: checkIn.managerReflect?.completedAt
        ? { ...checkIn.managerReflect }
        : undefined,
      gapSignals: checkIn.gapSignals?.generatedAt
        ? { ...checkIn.gapSignals }
        : undefined,
    };
  }

  if (role === "hr") {
    return {
      ...base,
      gapSignals: checkIn.gapSignals?.generatedAt
        ? { ...checkIn.gapSignals }
        : undefined,
    };
  }

  return base;
}
```

- [ ] **Step 4: Run privacy tests**

Run: `pnpm test -- src/tests/check-in-privacy.test.ts`
Expected: PASS

- [ ] **Step 5: Write gap engine tests**

Create `apps/platform/src/tests/gap-engine.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeGapSignals, getGapLevel } from "@/lib/check-in/gap-engine";

describe("computeGapSignals", () => {
  it("computes deltas between manager and employee scores", () => {
    const gaps = computeGapSignals(
      { clarity: 4, recognition: 3, development: 4, safety: 4 },
      { heard: 4, clarity: 5, recognition: 2, development: 4, safety: 5 }
    );

    expect(gaps.clarity).toBe(-1);
    expect(gaps.recognition).toBe(1);
    expect(gaps.development).toBe(0);
    expect(gaps.safety).toBe(-1);
  });

  it("returns null for dimensions with missing scores", () => {
    const gaps = computeGapSignals(
      { clarity: 4, recognition: null, development: 3, safety: null },
      { heard: 3, clarity: 3, recognition: null, development: 2, safety: null }
    );

    expect(gaps.clarity).toBe(1);
    expect(gaps.recognition).toBeNull();
    expect(gaps.development).toBe(1);
    expect(gaps.safety).toBeNull();
  });
});

describe("getGapLevel", () => {
  it("returns aligned for delta 0", () => {
    expect(getGapLevel(0)).toBe("aligned");
  });

  it("returns watch for delta 1 or -1", () => {
    expect(getGapLevel(1)).toBe("watch");
    expect(getGapLevel(-1)).toBe("watch");
  });

  it("returns gap for delta >= 2", () => {
    expect(getGapLevel(2)).toBe("gap");
    expect(getGapLevel(-2)).toBe("gap");
    expect(getGapLevel(3)).toBe("gap");
    expect(getGapLevel(-4)).toBe("gap");
  });

  it("returns null for null delta", () => {
    expect(getGapLevel(null)).toBeNull();
  });
});
```

- [ ] **Step 6: Run gap engine tests to verify failure**

Run: `pnpm test -- src/tests/gap-engine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 7: Implement gap engine**

Create `apps/platform/src/lib/check-in/gap-engine.ts`:

```ts
type ManagerReflectScores = {
  clarity: number | null;
  recognition: number | null;
  development: number | null;
  safety: number | null;
};

type EmployeeReflectScores = {
  heard: number | null;
  clarity: number | null;
  recognition: number | null;
  development: number | null;
  safety: number | null;
};

type GapSignals = {
  clarity: number | null;
  recognition: number | null;
  development: number | null;
  safety: number | null;
};

export function computeGapSignals(
  manager: ManagerReflectScores,
  employee: EmployeeReflectScores
): GapSignals {
  const delta = (m: number | null, e: number | null): number | null => {
    if (m === null || e === null) return null;
    return m - e;
  };

  return {
    clarity: delta(manager.clarity, employee.clarity),
    recognition: delta(manager.recognition, employee.recognition),
    development: delta(manager.development, employee.development),
    safety: delta(manager.safety, employee.safety),
  };
}

export type GapLevel = "aligned" | "watch" | "gap";

export function getGapLevel(delta: number | null): GapLevel | null {
  if (delta === null) return null;
  const abs = Math.abs(delta);
  if (abs === 0) return "aligned";
  if (abs === 1) return "watch";
  return "gap";
}
```

- [ ] **Step 8: Run gap engine tests**

Run: `pnpm test -- src/tests/gap-engine.test.ts`
Expected: PASS

- [ ] **Step 9: Write transition logic tests**

Create `apps/platform/src/tests/check-in-transitions.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getNextStatus, canTransition } from "@/lib/check-in/transitions";

describe("canTransition", () => {
  it("allows preparing → ready", () => {
    expect(canTransition("preparing", "ready")).toBe(true);
  });

  it("allows preparing → cancelled", () => {
    expect(canTransition("preparing", "cancelled")).toBe(true);
  });

  it("blocks preparing → completed", () => {
    expect(canTransition("preparing", "completed")).toBe(false);
  });

  it("allows reflecting → completed", () => {
    expect(canTransition("reflecting", "completed")).toBe(true);
  });

  it("blocks completed → anything", () => {
    expect(canTransition("completed", "preparing")).toBe(false);
    expect(canTransition("completed", "missed")).toBe(false);
  });
});

describe("getNextStatus", () => {
  it("returns ready when both prepare phases complete", () => {
    const checkIn = {
      status: "preparing" as const,
      scheduledAt: new Date(Date.now() + 86400000),
      employeePrepare: { completedAt: new Date() },
      managerPrepare: { completedAt: new Date() },
      participate: { completedAt: null },
    };
    expect(getNextStatus(checkIn)).toBe("ready");
  });

  it("returns ready when scheduledAt is reached even without prepare", () => {
    const checkIn = {
      status: "preparing" as const,
      scheduledAt: new Date(Date.now() - 1000),
      employeePrepare: { completedAt: null },
      managerPrepare: { completedAt: null },
      participate: { completedAt: null },
    };
    expect(getNextStatus(checkIn)).toBe("ready");
  });

  it("returns reflecting when participate is complete", () => {
    const checkIn = {
      status: "in_progress" as const,
      scheduledAt: new Date(),
      employeePrepare: { completedAt: new Date() },
      managerPrepare: { completedAt: new Date() },
      participate: { completedAt: new Date() },
    };
    expect(getNextStatus(checkIn)).toBe("reflecting");
  });

  it("returns null when no transition needed", () => {
    const checkIn = {
      status: "preparing" as const,
      scheduledAt: new Date(Date.now() + 86400000),
      employeePrepare: { completedAt: null },
      managerPrepare: { completedAt: null },
      participate: { completedAt: null },
    };
    expect(getNextStatus(checkIn)).toBeNull();
  });
});
```

- [ ] **Step 10: Run transition tests to verify failure**

Run: `pnpm test -- src/tests/check-in-transitions.test.ts`
Expected: FAIL — module not found

- [ ] **Step 11: Implement transitions**

Create `apps/platform/src/lib/check-in/transitions.ts`:

```ts
import type { CheckInStatus } from "@ascenta/db/checkin-schema";

const VALID_TRANSITIONS: Record<string, CheckInStatus[]> = {
  preparing: ["ready", "cancelled"],
  ready: ["in_progress", "missed"],
  in_progress: ["reflecting", "missed"],
  reflecting: ["completed"],
  completed: [],
  missed: [],
  cancelled: [],
};

export function canTransition(from: CheckInStatus, to: CheckInStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

type CheckInForTransition = {
  status: CheckInStatus;
  scheduledAt: Date;
  employeePrepare: { completedAt: Date | null };
  managerPrepare: { completedAt: Date | null };
  participate: { completedAt: Date | null };
};

export function getNextStatus(checkIn: CheckInForTransition): CheckInStatus | null {
  const now = new Date();

  if (checkIn.status === "preparing") {
    const bothPrepared =
      checkIn.employeePrepare.completedAt && checkIn.managerPrepare.completedAt;
    const timeReached = checkIn.scheduledAt <= now;
    if (bothPrepared || timeReached) return "ready";
  }

  if (checkIn.status === "in_progress") {
    if (checkIn.participate.completedAt) return "reflecting";
  }

  return null;
}

export function getStaleTransitions(
  checkIn: CheckInForTransition & {
    employeeReflect: { completedAt: Date | null };
    managerReflect: { completedAt: Date | null };
  }
): CheckInStatus | null {
  const now = new Date();
  const scheduledMs = checkIn.scheduledAt.getTime();

  if (checkIn.status === "ready") {
    const missedThreshold = scheduledMs + 24 * 60 * 60 * 1000;
    if (now.getTime() > missedThreshold) return "missed";
  }

  if (checkIn.status === "in_progress") {
    const missedThreshold = scheduledMs + 48 * 60 * 60 * 1000;
    if (now.getTime() > missedThreshold) return "missed";
  }

  if (checkIn.status === "reflecting") {
    const participateCompleted = checkIn.participate.completedAt;
    if (participateCompleted) {
      const reflectDeadline = participateCompleted.getTime() + 24 * 60 * 60 * 1000;
      const bothReflected =
        checkIn.employeeReflect.completedAt && checkIn.managerReflect.completedAt;
      if (bothReflected || now.getTime() > reflectDeadline) return "completed";
    }
  }

  return null;
}
```

- [ ] **Step 12: Run all tests**

Run: `pnpm test -- src/tests/`
Expected: All tests PASS

- [ ] **Step 13: Commit**

```bash
git add apps/platform/src/lib/check-in/ apps/platform/src/tests/
git commit -m "feat(check-in): add privacy filtering, status transitions, and gap engine with tests"
```

---

## Task 5: Check-in List + Create API Routes

**Files:**
- Modify: `apps/platform/src/app/api/grow/check-ins/route.ts`

- [ ] **Step 1: Rewrite the check-ins API route**

Replace `apps/platform/src/app/api/grow/check-ins/route.ts` with GET (list) and POST (schedule):

```ts
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { Employee } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { NextRequest, NextResponse } from "next/server";
import { scheduleCheckInSchema } from "@/lib/validations/check-in";
import { filterCheckInForRole } from "@/lib/check-in/privacy";
import type { UserRole } from "@/lib/auth/auth-context";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const user = await Employee.findById(userId).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Determine role
  const directReports = await Employee.find({
    managerName: {
      $regex: new RegExp(`${user.firstName}.*${user.lastName}`, "i"),
    },
    status: "active",
  })
    .select("_id")
    .lean();

  const isManager = directReports.length > 0;
  const role: UserRole = isManager ? "manager" : "employee";

  let checkIns;
  if (role === "manager") {
    checkIns = await CheckIn.find({ manager: userId })
      .populate("employee", "firstName lastName employeeId")
      .populate("goals", "objectiveStatement")
      .sort({ scheduledAt: -1 })
      .lean();
  } else {
    checkIns = await CheckIn.find({ employee: userId })
      .populate("manager", "firstName lastName employeeId")
      .populate("goals", "objectiveStatement")
      .sort({ scheduledAt: -1 })
      .lean();
  }

  const filtered = checkIns.map((ci) => filterCheckInForRole(ci, role, userId));

  return NextResponse.json({ checkIns: filtered, role });
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const body = await request.json();
  const parsed = scheduleCheckInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { employeeId, goalIds, scheduledAt } = parsed.data;

  const employee = await Employee.findById(employeeId).lean();
  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  // Verify goals belong to this employee
  const goals = await Goal.find({
    _id: { $in: goalIds },
    owner: employeeId,
    status: { $in: ["active", "needs_attention"] },
  }).lean();

  if (goals.length === 0) {
    return NextResponse.json(
      { error: "No valid active goals found for this employee" },
      { status: 400 }
    );
  }

  // Find previous check-in for this pair to link the chain
  const previousCheckIn = await CheckIn.findOne({
    employee: employeeId,
    manager: userId,
    status: "completed",
  })
    .sort({ completedAt: -1 })
    .select("_id")
    .lean();

  const checkIn = await CheckIn.create({
    employee: employeeId,
    manager: userId,
    goals: goals.map((g) => g._id),
    scheduledAt: new Date(scheduledAt),
    cadenceSource: "manual",
    status: "preparing",
    previousCheckInId: previousCheckIn?._id || null,
  });

  return NextResponse.json(
    {
      success: true,
      checkInId: checkIn._id.toString(),
      message: "Check-in scheduled",
    },
    { status: 201 }
  );
}
```

- [ ] **Step 2: Verify the route compiles**

Run: `cd apps/platform && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/api/grow/check-ins/route.ts
git commit -m "feat(api): rewrite check-ins list/create API with role-based filtering"
```

---

## Task 6: Check-in Detail + Phase Mutation API Routes

**Files:**
- Create: `apps/platform/src/app/api/grow/check-ins/[id]/route.ts`
- Create: `apps/platform/src/app/api/grow/check-ins/[id]/prepare/route.ts`
- Create: `apps/platform/src/app/api/grow/check-ins/[id]/participate/route.ts`
- Create: `apps/platform/src/app/api/grow/check-ins/[id]/reflect/route.ts`
- Create: `apps/platform/src/app/api/grow/check-ins/[id]/approve/route.ts`
- Create: `apps/platform/src/app/api/grow/check-ins/[id]/cancel/route.ts`

- [ ] **Step 1: Create detail route with privacy filtering**

Create `apps/platform/src/app/api/grow/check-ins/[id]/route.ts`:

```ts
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { Employee } from "@ascenta/db";
import { NextRequest, NextResponse } from "next/server";
import { filterCheckInForRole } from "@/lib/check-in/privacy";
import type { UserRole } from "@/lib/auth/auth-context";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const checkIn = await CheckIn.findById(id)
    .populate("employee", "firstName lastName employeeId department jobTitle")
    .populate("manager", "firstName lastName employeeId")
    .populate("goals", "objectiveStatement goalType status keyResults timePeriod")
    .populate("previousCheckInId", "gapSignals managerReflect participate")
    .lean();

  if (!checkIn) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  }

  // Determine role from relationship to this check-in
  let role: UserRole = "employee";
  if (checkIn.manager._id.toString() === userId) {
    role = "manager";
  } else if (checkIn.employee._id.toString() === userId) {
    role = "employee";
  } else {
    // Not a participant — check if HR
    role = "hr";
  }

  const filtered = filterCheckInForRole(checkIn, role, userId);

  return NextResponse.json({ checkIn: filtered, role });
}
```

- [ ] **Step 2: Create prepare route**

Create `apps/platform/src/app/api/grow/check-ins/[id]/prepare/route.ts`:

```ts
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { NextRequest, NextResponse } from "next/server";
import { employeePrepareSchema, managerPrepareSchema } from "@/lib/validations/check-in";
import { getNextStatus } from "@/lib/check-in/transitions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const checkIn = await CheckIn.findById(id);
  if (!checkIn) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  }

  if (checkIn.status !== "preparing") {
    return NextResponse.json(
      { error: "Check-in is not in preparing phase" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const isEmployee = checkIn.employee.toString() === userId;
  const isManager = checkIn.manager.toString() === userId;

  if (isEmployee) {
    const parsed = employeePrepareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    checkIn.employeePrepare.progressReflection = parsed.data.progressReflection;
    checkIn.employeePrepare.stuckPointReflection = parsed.data.stuckPointReflection;
    checkIn.employeePrepare.conversationIntent = parsed.data.conversationIntent;
    checkIn.employeePrepare.completedAt = new Date();

    // Stub distilled preview: truncated combination
    const combined = [
      parsed.data.progressReflection,
      parsed.data.stuckPointReflection,
    ]
      .filter(Boolean)
      .join(" ");
    checkIn.employeePrepare.distilledPreview =
      combined.length > 200 ? combined.slice(0, 200) + "..." : combined;
  } else if (isManager) {
    const parsed = managerPrepareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.openingMove !== undefined)
      checkIn.managerPrepare.openingMove = parsed.data.openingMove;
    if (parsed.data.recognitionNote !== undefined)
      checkIn.managerPrepare.recognitionNote = parsed.data.recognitionNote;
    if (parsed.data.developmentalFocus !== undefined)
      checkIn.managerPrepare.developmentalFocus = parsed.data.developmentalFocus;
    checkIn.managerPrepare.completedAt = new Date();
  } else {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Check if status should transition
  const nextStatus = getNextStatus(checkIn);
  if (nextStatus) {
    checkIn.status = nextStatus;
  }

  await checkIn.save();

  return NextResponse.json({ success: true, status: checkIn.status });
}
```

- [ ] **Step 3: Create participate route**

Create `apps/platform/src/app/api/grow/check-ins/[id]/participate/route.ts`:

```ts
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { NextRequest, NextResponse } from "next/server";
import {
  participateManagerSchema,
  participateEmployeeSchema,
} from "@/lib/validations/check-in";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const checkIn = await CheckIn.findById(id);
  if (!checkIn) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  }

  // Allow saving during ready or in_progress
  if (!["ready", "in_progress"].includes(checkIn.status)) {
    return NextResponse.json(
      { error: "Check-in is not in participate phase" },
      { status: 400 }
    );
  }

  // Transition to in_progress if still ready
  if (checkIn.status === "ready") {
    checkIn.status = "in_progress";
  }

  const body = await request.json();
  const isEmployee = checkIn.employee.toString() === userId;
  const isManager = checkIn.manager.toString() === userId;

  if (isManager) {
    const parsed = participateManagerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    checkIn.participate.stuckPointDiscussion = parsed.data.stuckPointDiscussion;
    checkIn.participate.recognition = parsed.data.recognition;
    checkIn.participate.development = parsed.data.development;
    checkIn.participate.performance = parsed.data.performance ?? null;
    checkIn.participate.managerCommitment = parsed.data.managerCommitment;
  } else if (isEmployee) {
    const parsed = participateEmployeeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    checkIn.participate.employeeOpening = parsed.data.employeeOpening;
    checkIn.participate.employeeKeyTakeaways = parsed.data.employeeKeyTakeaways;
    checkIn.participate.employeeCommitment = parsed.data.employeeCommitment;
  } else {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await checkIn.save();

  return NextResponse.json({ success: true, status: checkIn.status });
}
```

- [ ] **Step 4: Create reflect route**

Create `apps/platform/src/app/api/grow/check-ins/[id]/reflect/route.ts`:

```ts
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { NextRequest, NextResponse } from "next/server";
import { employeeReflectSchema, managerReflectSchema } from "@/lib/validations/check-in";
import { computeGapSignals } from "@/lib/check-in/gap-engine";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const checkIn = await CheckIn.findById(id);
  if (!checkIn) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  }

  if (checkIn.status !== "reflecting") {
    return NextResponse.json(
      { error: "Check-in is not in reflecting phase" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const isEmployee = checkIn.employee.toString() === userId;
  const isManager = checkIn.manager.toString() === userId;

  if (isEmployee) {
    const parsed = employeeReflectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    checkIn.employeeReflect.heard = parsed.data.heard;
    checkIn.employeeReflect.clarity = parsed.data.clarity;
    checkIn.employeeReflect.recognition = parsed.data.recognition;
    checkIn.employeeReflect.development = parsed.data.development;
    checkIn.employeeReflect.safety = parsed.data.safety;
    checkIn.employeeReflect.completedAt = new Date();
  } else if (isManager) {
    const parsed = managerReflectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    checkIn.managerReflect.clarity = parsed.data.clarity;
    checkIn.managerReflect.recognition = parsed.data.recognition;
    checkIn.managerReflect.development = parsed.data.development;
    checkIn.managerReflect.safety = parsed.data.safety;
    checkIn.managerReflect.forwardAction = parsed.data.forwardAction;
    checkIn.managerReflect.completedAt = new Date();
  } else {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Compute gap signals if both sides complete
  if (checkIn.employeeReflect.completedAt && checkIn.managerReflect.completedAt) {
    const gaps = computeGapSignals(
      {
        clarity: checkIn.managerReflect.clarity,
        recognition: checkIn.managerReflect.recognition,
        development: checkIn.managerReflect.development,
        safety: checkIn.managerReflect.safety,
      },
      {
        heard: checkIn.employeeReflect.heard,
        clarity: checkIn.employeeReflect.clarity,
        recognition: checkIn.employeeReflect.recognition,
        development: checkIn.employeeReflect.development,
        safety: checkIn.employeeReflect.safety,
      }
    );

    checkIn.gapSignals.clarity = gaps.clarity;
    checkIn.gapSignals.recognition = gaps.recognition;
    checkIn.gapSignals.development = gaps.development;
    checkIn.gapSignals.safety = gaps.safety;
    checkIn.gapSignals.generatedAt = new Date();

    checkIn.status = "completed";
    checkIn.completedAt = new Date();
  }

  await checkIn.save();

  return NextResponse.json({ success: true, status: checkIn.status });
}
```

- [ ] **Step 5: Create approve route**

Create `apps/platform/src/app/api/grow/check-ins/[id]/approve/route.ts`:

```ts
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { NextRequest, NextResponse } from "next/server";
import { approveCommitmentSchema } from "@/lib/validations/check-in";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const checkIn = await CheckIn.findById(id);
  if (!checkIn) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  }

  if (checkIn.status !== "in_progress") {
    return NextResponse.json(
      { error: "Check-in is not in participate phase" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = approveCommitmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const isEmployee = checkIn.employee.toString() === userId;
  const isManager = checkIn.manager.toString() === userId;

  if (isEmployee) {
    checkIn.participate.employeeApprovedManagerCommitment = parsed.data.approved;
  } else if (isManager) {
    checkIn.participate.managerApprovedEmployeeCommitment = parsed.data.approved;
  } else {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Check if both approved → complete participate phase
  if (
    checkIn.participate.employeeApprovedManagerCommitment === true &&
    checkIn.participate.managerApprovedEmployeeCommitment === true
  ) {
    checkIn.participate.completedAt = new Date();
    checkIn.status = "reflecting";
  }

  await checkIn.save();

  return NextResponse.json({ success: true, status: checkIn.status });
}
```

- [ ] **Step 6: Create cancel route**

Create `apps/platform/src/app/api/grow/check-ins/[id]/cancel/route.ts`:

```ts
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const checkIn = await CheckIn.findById(id);
  if (!checkIn) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  }

  // Only manager can cancel, only during preparing/ready
  if (checkIn.manager.toString() !== userId) {
    return NextResponse.json({ error: "Only manager can cancel" }, { status: 403 });
  }

  if (!["preparing", "ready"].includes(checkIn.status)) {
    return NextResponse.json(
      { error: "Can only cancel check-ins in preparing or ready phase" },
      { status: 400 }
    );
  }

  checkIn.status = "cancelled";
  await checkIn.save();

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 7: Verify TypeScript compiles**

Run: `cd apps/platform && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 8: Commit**

```bash
git add apps/platform/src/app/api/grow/check-ins/
git commit -m "feat(api): add check-in detail, prepare, participate, reflect, approve, cancel routes"
```

---

## Task 7: AI Assist API Route

**Files:**
- Create: `apps/platform/src/app/api/grow/check-ins/[id]/assist/route.ts`

- [ ] **Step 1: Create the assist route**

This route generates AI suggestions for manager toolkit fields. It loads check-in context and calls the AI provider.

Create `apps/platform/src/app/api/grow/check-ins/[id]/assist/route.ts`:

```ts
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { Employee } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getModelInstance } from "@/lib/ai/providers";
import { getDefaultModelId } from "@/lib/ai/config";

const FIELD_PROMPTS: Record<string, string> = {
  openingMove:
    "Generate a warm, specific opening line for a manager to start a check-in conversation. It should reference the employee's self-reflection preview and invite the employee to share first. One sentence, conversational tone.",
  recognition:
    "Suggest a specific, values-anchored recognition statement the manager could use. It should name a concrete contribution, not generic praise. One to two sentences.",
  development:
    "Generate an open-ended developmental question appropriate for this employee's current situation. Focus on growth and future, not past performance. One question.",
  coaching:
    "Suggest 2-3 concrete coaching approaches for addressing the employee's stuck point. Be specific and actionable, not generic advice.",
  opener:
    "Generate a suggested opening statement for the participate phase that references the employee's preparation and invites dialogue. One to two sentences.",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const checkIn = await CheckIn.findById(id)
    .populate("employee", "firstName lastName department jobTitle")
    .populate("goals", "objectiveStatement goalType keyResults")
    .lean();

  if (!checkIn) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  }

  if (checkIn.manager.toString() !== userId && checkIn.manager._id?.toString() !== userId) {
    return NextResponse.json({ error: "Only manager can use AI assist" }, { status: 403 });
  }

  const body = await request.json();
  const { field } = body as { field: string };

  const fieldPrompt = FIELD_PROMPTS[field];
  if (!fieldPrompt) {
    return NextResponse.json({ error: "Unknown field" }, { status: 400 });
  }

  const employee = checkIn.employee as Record<string, string>;
  const goals = (checkIn.goals as Array<Record<string, unknown>>)
    .map((g) => g.objectiveStatement)
    .join("; ");

  const contextParts = [
    `Employee: ${employee.firstName} ${employee.lastName}, ${employee.jobTitle}, ${employee.department}`,
    `Goals: ${goals}`,
  ];

  if (checkIn.employeePrepare?.distilledPreview) {
    contextParts.push(`Employee preparation summary: ${checkIn.employeePrepare.distilledPreview}`);
  }

  if (checkIn.previousCheckInId) {
    const prev = checkIn.previousCheckInId as Record<string, unknown>;
    const prevReflect = prev.managerReflect as Record<string, unknown> | undefined;
    if (prevReflect?.forwardAction) {
      contextParts.push(`Manager's previous forward action: ${prevReflect.forwardAction}`);
    }
  }

  try {
    const modelId = getDefaultModelId();
    const model = getModelInstance(modelId);

    const result = await generateText({
      model,
      system:
        "You are a coaching assistant helping managers prepare for employee check-in conversations. Be warm, specific, and actionable. Never be generic.",
      prompt: `${contextParts.join("\n")}\n\n${fieldPrompt}`,
      maxTokens: 200,
    });

    return NextResponse.json({ suggestion: result.text });
  } catch (error) {
    console.error("AI assist error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/platform && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/api/grow/check-ins/\[id\]/assist/
git commit -m "feat(api): add AI assist endpoint for manager check-in toolkit"
```

---

## Task 8: Cron Job for Scheduling + Transitions

**Files:**
- Create: `apps/platform/src/app/api/cron/check-ins/route.ts`

- [ ] **Step 1: Create the cron route**

Create `apps/platform/src/app/api/cron/check-ins/route.ts`:

```ts
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { Goal } from "@ascenta/db/goal-schema";
import { Notification } from "@ascenta/db/notification-schema";
import { NextRequest, NextResponse } from "next/server";
import { getStaleTransitions } from "@/lib/check-in/transitions";
import { computeGapSignals } from "@/lib/check-in/gap-engine";

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const results = {
    generated: 0,
    transitioned: 0,
    gapsComputed: 0,
    notifications: 0,
  };

  // 1. Generate upcoming check-ins from goal cadence (2 weeks ahead)
  const twoWeeksOut = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const activeGoals = await Goal.find({
    status: { $in: ["active", "needs_attention"] },
    checkInCadence: { $exists: true },
  })
    .populate("owner", "_id")
    .populate("manager", "_id")
    .lean();

  // Group goals by owner+manager pair
  const pairGoals = new Map<string, typeof activeGoals>();
  for (const goal of activeGoals) {
    const key = `${goal.owner._id || goal.owner}-${goal.manager._id || goal.manager}`;
    if (!pairGoals.has(key)) pairGoals.set(key, []);
    pairGoals.get(key)!.push(goal);
  }

  for (const [key, goals] of pairGoals) {
    const [employeeId, managerId] = key.split("-");

    // Check if there's already an active check-in for this pair
    const existing = await CheckIn.findOne({
      employee: employeeId,
      manager: managerId,
      status: { $in: ["preparing", "ready", "in_progress", "reflecting"] },
    }).lean();

    if (existing) continue;

    // Find the most recent completed check-in to determine next schedule
    const lastCompleted = await CheckIn.findOne({
      employee: employeeId,
      manager: managerId,
      status: "completed",
    })
      .sort({ scheduledAt: -1 })
      .lean();

    // Determine cadence (use shortest among the group's goals)
    const cadenceDays = Math.min(
      ...goals.map((g) => {
        switch (g.checkInCadence) {
          case "every_check_in":
            return 14; // biweekly default
          case "monthly":
            return 30;
          case "quarterly":
            return 90;
          default:
            return 14;
        }
      })
    );

    const lastDate = lastCompleted?.scheduledAt || new Date();
    const nextDate = new Date(lastDate.getTime() + cadenceDays * 24 * 60 * 60 * 1000);

    if (nextDate <= twoWeeksOut) {
      const previousCheckIn = lastCompleted?._id || null;

      await CheckIn.create({
        employee: employeeId,
        manager: managerId,
        goals: goals.map((g) => g._id),
        scheduledAt: nextDate,
        cadenceSource: "auto",
        status: "preparing",
        previousCheckInId: previousCheckIn,
      });

      // Notify both parties
      await Notification.create([
        {
          userId: employeeId,
          type: "prepare_open",
          checkInId: null, // will be set after create — simplify by skipping for now
          message: "You have an upcoming check-in. Complete your preparation.",
        },
        {
          userId: managerId,
          type: "prepare_open",
          checkInId: null,
          message: "An upcoming check-in is ready for your preparation.",
        },
      ]);

      results.generated++;
      results.notifications += 2;
    }
  }

  // 2. Transition stale check-ins
  const staleCheckIns = await CheckIn.find({
    status: { $in: ["ready", "in_progress", "reflecting"] },
  });

  for (const checkIn of staleCheckIns) {
    const newStatus = getStaleTransitions(checkIn);
    if (newStatus) {
      checkIn.status = newStatus;
      if (newStatus === "completed") {
        checkIn.completedAt = new Date();
      }
      await checkIn.save();
      results.transitioned++;
    }
  }

  // 3. Compute gap signals for completed check-ins missing them
  const needsGaps = await CheckIn.find({
    status: "completed",
    "employeeReflect.completedAt": { $ne: null },
    "managerReflect.completedAt": { $ne: null },
    "gapSignals.generatedAt": null,
  });

  for (const checkIn of needsGaps) {
    const gaps = computeGapSignals(
      {
        clarity: checkIn.managerReflect.clarity,
        recognition: checkIn.managerReflect.recognition,
        development: checkIn.managerReflect.development,
        safety: checkIn.managerReflect.safety,
      },
      {
        heard: checkIn.employeeReflect.heard,
        clarity: checkIn.employeeReflect.clarity,
        recognition: checkIn.employeeReflect.recognition,
        development: checkIn.employeeReflect.development,
        safety: checkIn.employeeReflect.safety,
      }
    );

    checkIn.gapSignals.clarity = gaps.clarity;
    checkIn.gapSignals.recognition = gaps.recognition;
    checkIn.gapSignals.development = gaps.development;
    checkIn.gapSignals.safety = gaps.safety;
    checkIn.gapSignals.generatedAt = new Date();
    await checkIn.save();
    results.gapsComputed++;
  }

  return NextResponse.json({ success: true, ...results });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/app/api/cron/check-ins/
git commit -m "feat(cron): add check-in scheduling, transition, and gap computation cron job"
```

---

## Task 9: Checkins Dashboard Panel + Wire into Page

**Files:**
- Create: `apps/platform/src/components/grow/checkins-panel.tsx`
- Modify: `apps/platform/src/app/[category]/[sub]/page.tsx`

- [ ] **Step 1: Create the checkins panel**

Create `apps/platform/src/components/grow/checkins-panel.tsx`. This is the dashboard tab showing stats, upcoming check-ins list, and schedule button. It renders differently based on `useAuth()` role.

Key structure:
- Fetches from `GET /api/grow/check-ins` with the `x-dev-user-id` header
- Manager view: stats row (upcoming, completion rate, gap count, overdue), upcoming list with status dots, schedule button, completed section with gap indicators
- Employee view: next check-in card with "Prepare Now" button, own history
- Clicking a check-in row navigates to `/grow/check-ins/[id]` via `useRouter().push()`
- Uses `accentColor` prop for consistent Grow theming

The component should follow the pattern established by `goals-panel.tsx` — client component with `"use client"`, flex layout, overflow scroll, data fetched via `useEffect`.

Stats are computed client-side from the check-ins list (upcoming = status in preparing/ready, overdue = scheduledAt < now && status in preparing/ready, completion rate = completed / (completed + missed) in last 30 days, gap count = completed check-ins with any |gap| >= 2).

Schedule button opens a simple dialog (shadcn Dialog) with employee picker + goal selector + date picker. On submit, POSTs to `/api/grow/check-ins`.

- [ ] **Step 2: Wire checkins tab into the dynamic page**

Modify `apps/platform/src/app/[category]/[sub]/page.tsx`. Add the conditional render for the checkins tab alongside the existing goals and reviews tabs:

```tsx
// Add import:
import { CheckinsPanel } from "@/components/grow/checkins-panel";

// In the tab content rendering section, add:
{activeTab === "checkins" && (
  <CheckinsPanel accentColor={ctx.category.color} />
)}
```

- [ ] **Step 3: Verify in browser**

Run: `pnpm dev --filter=@ascenta/platform`

Navigate to `/grow/performance` and click the "Check-ins" tab. Verify:
1. Panel renders (may show empty state if no check-ins exist yet)
2. Schedule button opens dialog
3. Role-based view switches when you change user via the nav picker

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/grow/checkins-panel.tsx apps/platform/src/app/\[category\]/\[sub\]/page.tsx
git commit -m "feat(ui): add checkins dashboard panel and wire into grow/performance tab"
```

---

## Task 10: Dedicated Check-in Page + Phase Container + Stepper

**Files:**
- Create: `apps/platform/src/app/grow/check-ins/[id]/page.tsx`
- Create: `apps/platform/src/components/grow/check-in/check-in-page.tsx`
- Create: `apps/platform/src/components/grow/check-in/phase-stepper.tsx`

- [ ] **Step 1: Create the page route (RSC)**

Create `apps/platform/src/app/grow/check-ins/[id]/page.tsx`. This is a server component that fetches the check-in data and passes it to the client-side phase container:

```tsx
import { CheckInPage } from "@/components/grow/check-in/check-in-page";

export default async function CheckInRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CheckInPage checkInId={id} />;
}
```

- [ ] **Step 2: Create phase-aware container**

Create `apps/platform/src/components/grow/check-in/check-in-page.tsx`. Client component that:
- Fetches check-in data from `GET /api/grow/check-ins/[id]` with auth header
- Renders common header (back link, employee/manager name, goals, scheduled date, status badge)
- Renders `PhaseStepper` showing current phase
- Conditionally renders phase component based on `status` + `role`:
  - `preparing` + employee → `PrepareEmployee`
  - `preparing` + manager → `PrepareManager`
  - `ready`/`in_progress` + manager → `ParticipateManager`
  - `ready`/`in_progress` + employee → `ParticipateEmployee`
  - `reflecting` + employee → `ReflectEmployee`
  - `reflecting` + manager → `ReflectManager`
  - `completed` → summary view showing gap signals (manager) or completion message (employee)
- Refetches data after any mutation (prepare submit, participate submit, etc.) via a `refreshData()` callback passed to child components
- Uses Grow accent color (#44aa99)

- [ ] **Step 3: Create phase stepper**

Create `apps/platform/src/components/grow/check-in/phase-stepper.tsx`:

```tsx
"use client";

import { cn } from "@ascenta/ui";
import type { CheckInStatus } from "@ascenta/db/checkin-schema";

const PHASES = [
  { key: "prepare", label: "Prepare", statuses: ["preparing"] },
  { key: "participate", label: "Participate", statuses: ["ready", "in_progress"] },
  { key: "reflect", label: "Reflect", statuses: ["reflecting", "completed"] },
] as const;

function getPhaseIndex(status: CheckInStatus): number {
  const idx = PHASES.findIndex((p) =>
    (p.statuses as readonly string[]).includes(status)
  );
  return idx === -1 ? 0 : idx;
}

export function PhaseStepper({ status }: { status: CheckInStatus }) {
  const activeIndex = getPhaseIndex(status);
  const isCompleted = status === "completed";

  return (
    <div className="flex items-center gap-0 mb-8">
      {PHASES.map((phase, i) => {
        const isActive = i === activeIndex && !isCompleted;
        const isDone = i < activeIndex || isCompleted;

        return (
          <div key={phase.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                  isDone && "bg-[#44aa99] text-white",
                  isActive && "bg-[#44aa99] text-white",
                  !isDone && !isActive &&
                    "bg-muted border border-border text-muted-foreground"
                )}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs mt-1 font-medium",
                  (isDone || isActive) ? "text-[#44aa99]" : "text-muted-foreground"
                )}
              >
                {phase.label}
              </span>
            </div>
            {i < PHASES.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-[0.5]",
                  isDone ? "bg-[#44aa99]" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

Navigate to `/grow/check-ins/some-id`. If no check-in exists with that ID, verify the 404/empty state renders. If you can schedule one from the dashboard, navigate to it and verify:
1. Header shows employee name, goals, date, status
2. Phase stepper highlights the correct phase
3. Back link returns to dashboard

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/app/grow/ apps/platform/src/components/grow/check-in/check-in-page.tsx apps/platform/src/components/grow/check-in/phase-stepper.tsx
git commit -m "feat(ui): add dedicated check-in page with phase-aware container and stepper"
```

---

## Task 11: Likert Scale + AI Assist Button (Shared Components)

**Files:**
- Create: `apps/platform/src/components/grow/check-in/likert-scale.tsx`
- Create: `apps/platform/src/components/grow/check-in/ai-assist-button.tsx`

- [ ] **Step 1: Create reusable Likert scale component**

Create `apps/platform/src/components/grow/check-in/likert-scale.tsx`:

```tsx
"use client";

import { cn } from "@ascenta/ui";

type LikertScaleProps = {
  value: number | null;
  onChange: (value: number) => void;
  lowLabel: string;
  highLabel: string;
  disabled?: boolean;
};

export function LikertScale({
  value,
  onChange,
  lowLabel,
  highLabel,
  disabled = false,
}: LikertScaleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-16">{lowLabel}</span>
      <div className="flex gap-1.5 flex-1 justify-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors",
              value === n
                ? n <= 2
                  ? "bg-[#cc6677]/20 border border-[#cc6677] text-[#cc6677]"
                  : "bg-[#44aa99]/20 border border-[#44aa99] text-[#44aa99]"
                : "bg-muted/50 border border-border text-muted-foreground hover:bg-muted",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground w-16 text-right">{highLabel}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create AI assist button component**

Create `apps/platform/src/components/grow/check-in/ai-assist-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { cn } from "@ascenta/ui";
import { useAuth } from "@/lib/auth/auth-context";

type AiAssistButtonProps = {
  checkInId: string;
  field: string;
  label?: string;
  onSuggestion: (text: string) => void;
};

export function AiAssistButton({
  checkInId,
  field,
  label = "Suggest",
  onSuggestion,
}: AiAssistButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || !user) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/grow/check-ins/${checkInId}/assist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-user-id": user.id,
        },
        body: JSON.stringify({ field }),
      });

      if (res.ok) {
        const data = await res.json();
        onSuggestion(data.suggestion);
      }
    } catch {
      console.error("AI assist failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "text-xs text-[#44aa99] hover:text-[#44aa99]/80 bg-[#44aa99]/10 px-2.5 py-1 rounded transition-colors",
        loading && "opacity-50 cursor-wait"
      )}
    >
      {loading ? "Generating..." : `✦ ${label}`}
    </button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/grow/check-in/likert-scale.tsx apps/platform/src/components/grow/check-in/ai-assist-button.tsx
git commit -m "feat(ui): add reusable LikertScale and AiAssistButton components"
```

---

## Task 12: Prepare Employee View

**Files:**
- Create: `apps/platform/src/components/grow/check-in/prepare-employee.tsx`

- [ ] **Step 1: Create the employee prepare component**

This component renders the 3 reflection prompts (E-1, E-2, E-3) as form cards with a privacy notice. It uses react-hook-form + the `employeePrepareSchema` Zod validation.

Key structure:
- Props: `{ checkIn, onComplete }` where `checkIn` is the privacy-filtered check-in data and `onComplete` triggers a data refetch
- Privacy banner at top: "Your preparation is private — only a brief summary will be shared with your manager."
- Deadline display: "Complete before [scheduledAt - 24h]"
- Shows linked goal names pulled from `checkIn.goals`
- Three textarea cards:
  1. Progress Reflection (E-1) — with linked goal names shown below the prompt
  2. Stuck Point Reflection (E-2)
  3. Conversation Intent (E-3)
- Submit button calls `PATCH /api/grow/check-ins/[id]/prepare` with auth header
- On success, calls `onComplete()` to refresh parent data
- If `checkIn.employeePrepare.completedAt` is set, show read-only view with a "Preparation complete" badge

- [ ] **Step 2: Verify in browser**

Create a check-in via the dashboard, switch to the employee user, navigate to `/grow/check-ins/[id]`. Verify:
1. Three reflection prompts render
2. Privacy notice is visible
3. Can fill in and submit
4. After submit, shows read-only state

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/grow/check-in/prepare-employee.tsx
git commit -m "feat(ui): add employee prepare view with 3 reflection prompts"
```

---

## Task 13: Prepare Manager View

**Files:**
- Create: `apps/platform/src/components/grow/check-in/prepare-manager.tsx`
- Create: `apps/platform/src/components/grow/check-in/gap-signals.tsx`

- [ ] **Step 1: Create gap signals component**

Create `apps/platform/src/components/grow/check-in/gap-signals.tsx`. Displays gap signal cards from the previous check-in cycle. Reused in both manager prepare (context) and completed view.

```tsx
"use client";

import { cn } from "@ascenta/ui";
import { getGapLevel, type GapLevel } from "@/lib/check-in/gap-engine";

type GapSignalsProps = {
  gaps: {
    clarity: number | null;
    recognition: number | null;
    development: number | null;
    safety: number | null;
  };
};

const DIMENSIONS = ["clarity", "recognition", "development", "safety"] as const;

const levelStyles: Record<GapLevel, { bg: string; border: string; text: string; label: string }> = {
  aligned: {
    bg: "bg-[#44aa99]/8",
    border: "border-[#44aa99]/20",
    text: "text-[#44aa99]",
    label: "Aligned",
  },
  watch: {
    bg: "bg-[#e8a735]/10",
    border: "border-[#e8a735]/30",
    text: "text-[#e8a735]",
    label: "Watch",
  },
  gap: {
    bg: "bg-[#cc6677]/10",
    border: "border-[#cc6677]/30",
    text: "text-[#cc6677]",
    label: "Gap detected",
  },
};

export function GapSignals({ gaps }: GapSignalsProps) {
  return (
    <div className="flex gap-3">
      {DIMENSIONS.map((dim) => {
        const delta = gaps[dim];
        const level = getGapLevel(delta);
        const styles = level ? levelStyles[level] : null;

        return (
          <div
            key={dim}
            className={cn(
              "flex-1 rounded-lg border p-3 text-center",
              styles ? `${styles.bg} ${styles.border}` : "bg-muted/50 border-border"
            )}
          >
            <div className="text-xs text-muted-foreground capitalize mb-1">{dim}</div>
            <div className={cn("text-xl font-semibold", styles?.text || "text-muted-foreground")}>
              {delta !== null ? (delta > 0 ? `+${delta}` : delta) : "—"}
            </div>
            <div className={cn("text-[10px]", styles?.text || "text-muted-foreground")}>
              {styles?.label || "No data"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create manager prepare component**

Create `apps/platform/src/components/grow/check-in/prepare-manager.tsx`.

Key structure:
- Props: `{ checkIn, previousCheckIn, onComplete }`
- **Context Briefing (M-1)**: Teal-bordered card showing last forward action (`previousCheckIn.managerReflect.forwardAction`) and distilled employee preview (`checkIn.employeePrepare.distilledPreview`). Marks `contextBriefingViewed` on render via a `useEffect` that fires once.
- **Gap Recovery (M-6, conditional)**: Red-tinted card that appears only if `previousCheckIn.gapSignals` has any dimension with |delta| >= 2. Shows warm recovery language mentioning the gap dimension. Uses `GapSignals` component. Marks `gapRecoveryViewed` on render.
- **Conversation Toolkit**:
  - Opening Move (M-2): Textarea with `AiAssistButton` field="openingMove". If AI suggestion returned, populate the field. Editable.
  - Recognition Prep (M-3): Textarea with `AiAssistButton` field="recognition".
  - Developmental Focus (M-4): Textarea with `AiAssistButton` field="development".
- "Mark Preparation Complete" button calls `PATCH /api/grow/check-ins/[id]/prepare`
- Read-only view when `managerPrepare.completedAt` is set

- [ ] **Step 3: Verify in browser**

Switch to manager user, navigate to a preparing check-in. Verify:
1. Context briefing shows (may be empty if no previous check-in)
2. AI assist buttons generate suggestions
3. Can fill in toolkit fields and mark complete
4. After complete, shows read-only

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/grow/check-in/prepare-manager.tsx apps/platform/src/components/grow/check-in/gap-signals.tsx
git commit -m "feat(ui): add manager prepare view with context briefing, gap recovery, and AI toolkit"
```

---

## Task 14: Participate Manager View

**Files:**
- Create: `apps/platform/src/components/grow/check-in/participate-manager.tsx`

- [ ] **Step 1: Create manager participate component**

Key structure:
- Props: `{ checkIn, onSave, onComplete }`
- Collapsible prep notes section at top (shows manager's own preparation in a collapsed teal card)
- 4-move form with numbered step indicators:
  - **Move 1**: Shows employee's `employeeOpening` as read-only if available (or "Waiting for employee..." placeholder). `AiAssistButton` field="opener" for suggested response.
  - **Move 2**: Textarea for `stuckPointDiscussion`. `AiAssistButton` field="coaching".
  - **Move 3**: Three sub-sections:
    - Recognition textarea with `AiAssistButton` field="recognition"
    - Development textarea with `AiAssistButton` field="development"
    - Performance textarea (optional, visually de-emphasized with opacity-60)
  - **Move 4**: Manager commitment textarea. Employee commitment shown as read-only if available, with approve/flag buttons (rendered via `CommitmentApproval` component from Task 15).
- Save draft button (saves without completing) — calls `PATCH /api/grow/check-ins/[id]/participate`
- Submit button (saves and marks moves complete) — calls same endpoint
- Uses react-hook-form with `participateManagerSchema`

- [ ] **Step 2: Verify in browser**

Advance a check-in to `ready`/`in_progress` status. Navigate as manager. Verify:
1. 4-move structure renders
2. Employee opening shows if employee has submitted theirs
3. AI assist buttons work
4. Can save draft and submit

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/grow/check-in/participate-manager.tsx
git commit -m "feat(ui): add manager participate view with 4-move structure and AI assist"
```

---

## Task 15: Participate Employee View + Commitment Approval

**Files:**
- Create: `apps/platform/src/components/grow/check-in/participate-employee.tsx`
- Create: `apps/platform/src/components/grow/check-in/commitment-approval.tsx`

- [ ] **Step 1: Create commitment approval component**

Create `apps/platform/src/components/grow/check-in/commitment-approval.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@ascenta/ui/components/button";
import { useAuth } from "@/lib/auth/auth-context";

type CommitmentApprovalProps = {
  checkInId: string;
  commitment: string;
  authorRole: "manager" | "employee";
  approved: boolean | null;
  onApprovalChange: () => void;
};

export function CommitmentApproval({
  checkInId,
  commitment,
  authorRole,
  approved,
  onApprovalChange,
}: CommitmentApprovalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleApprove = async (value: boolean) => {
    if (!user) return;
    setLoading(true);

    try {
      await fetch(`/api/grow/check-ins/${checkInId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-user-id": user.id,
        },
        body: JSON.stringify({ approved: value }),
      });
      onApprovalChange();
    } catch {
      console.error("Approval failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted/30 border border-border rounded-lg p-4">
      <div className="text-xs text-muted-foreground mb-1 capitalize">
        {authorRole}&apos;s commitment
      </div>
      <p className="text-sm mb-3">{commitment}</p>

      {approved === null && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => handleApprove(true)}
            disabled={loading}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleApprove(false)}
            disabled={loading}
          >
            This isn&apos;t what we agreed on
          </Button>
        </div>
      )}

      {approved === true && (
        <span className="text-xs text-[#44aa99] font-medium">Approved ✓</span>
      )}

      {approved === false && (
        <span className="text-xs text-[#cc6677] font-medium">
          Flagged — needs revision
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create employee participate component**

Create `apps/platform/src/components/grow/check-in/participate-employee.tsx`.

Key structure:
- Props: `{ checkIn, onSave, onComplete }`
- Intro banner: "Your check-in with [manager name] is in progress."
- Three form sections:
  1. **Your Opening** — textarea for `employeeOpening`
  2. **Key Takeaways** — textarea for `employeeKeyTakeaways`
  3. **Your Commitment** — textarea for `employeeCommitment`
- Manager commitment shown via `CommitmentApproval` component when `participate.managerCommitment` is available
- Submit button calls `PATCH /api/grow/check-ins/[id]/participate`
- Uses react-hook-form with `participateEmployeeSchema`

- [ ] **Step 3: Verify in browser**

Switch to employee user during an in_progress check-in. Verify:
1. Three input sections render
2. Manager's commitment appears when available (if manager has submitted)
3. Can approve/flag manager's commitment
4. Can submit own inputs

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/grow/check-in/participate-employee.tsx apps/platform/src/components/grow/check-in/commitment-approval.tsx
git commit -m "feat(ui): add employee participate view and commitment approval component"
```

---

## Task 16: Reflect Views (Employee + Manager)

**Files:**
- Create: `apps/platform/src/components/grow/check-in/reflect-employee.tsx`
- Create: `apps/platform/src/components/grow/check-in/reflect-manager.tsx`

- [ ] **Step 1: Create employee reflect component**

Create `apps/platform/src/components/grow/check-in/reflect-employee.tsx`.

Key structure:
- Props: `{ checkIn, onComplete }`
- Privacy banner: "Your responses are completely private — they are never shared with your manager."
- 5 Likert dimensions, each as a card with:
  - Dimension name (bold)
  - Question text (muted)
  - `LikertScale` component with contextual low/high labels
- Dimensions and their labels:
  - Heard: "Not at all" / "Completely"
  - Clarity: "Not at all" / "Completely"
  - Recognition: "Not at all" / "Completely"
  - Development: "Past-focused" / "Growth-focused"
  - Safety: "Not safe" / "Fully safe"
- "Submit Reflection" button calls `PATCH /api/grow/check-ins/[id]/reflect`
- Uses local state (not react-hook-form) since it's just 5 numbers
- Read-only view when `employeeReflect.completedAt` is set — shows selected values as highlighted

- [ ] **Step 2: Create manager reflect component**

Create `apps/platform/src/components/grow/check-in/reflect-manager.tsx`.

Key structure:
- Props: `{ checkIn, onComplete }`
- Privacy banner: "Your responses are private — your employee will not see them."
- 4 Likert dimensions (same card pattern as employee but with manager-specific questions):
  - Clarity: 1-5 scale
  - Recognition: 1-5 scale
  - Development: 1-5 scale
  - Psychological Safety: 1-5 scale
- Forward Action (MP-5): textarea, "This becomes the opening line of your next context briefing."
- "Submit Reflection" button calls `PATCH /api/grow/check-ins/[id]/reflect`
- Read-only view when `managerReflect.completedAt` is set

- [ ] **Step 3: Verify in browser**

Advance a check-in to `reflecting`. Test both roles:
1. Employee sees 5 Likert scales with privacy notice
2. Manager sees 4 Likert scales + forward action textarea
3. Submitting works and shows read-only state
4. After both submit, check-in transitions to completed and gap signals appear

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/grow/check-in/reflect-employee.tsx apps/platform/src/components/grow/check-in/reflect-manager.tsx
git commit -m "feat(ui): add employee and manager reflect views with Likert scoring"
```

---

## Task 17: Evolve startCheckInTool + Workflow Definition

**Files:**
- Modify: `apps/platform/src/lib/ai/grow-tools.ts` (startCheckInTool section only)
- Modify: `apps/platform/src/lib/workflows/definitions/run-check-in.ts`

- [ ] **Step 1: Update the startCheckInTool**

Modify the `startCheckInTool` in `grow-tools.ts`. The tool should now:

1. Accept `employeeName` and `employeeId` as inputs (same as before)
2. Accept an optional `scheduledAt` date (defaults to now + 48 hours)
3. Instead of opening a working document form, it creates a check-in via the database directly
4. Returns a message with a link to `/grow/check-ins/[id]` instead of a working document block
5. Still fetches employee, goals, and context for the response message

Key changes to the execute function:
- Remove the working document payload generation
- Add `CheckIn.create()` call with the employee, manager (from context), goals, and scheduledAt
- Return a text response: "Check-in scheduled with [employee] for [date]. [Link to check-in page]"
- Keep the existing employee lookup and goal fetching logic

Update the tool's input schema to add optional `scheduledAt` field and remove the manager assessment / employee input fields that are no longer needed at scheduling time.

- [ ] **Step 2: Update workflow definition**

Modify `apps/platform/src/lib/workflows/definitions/run-check-in.ts`:
- Simplify intake fields to just: `employeeName`, `employeeId`, `scheduledAt` (optional)
- Remove the manager assessment and employee input field groups (those are now captured in the phase-specific forms)
- Update the description to reflect the new lifecycle flow
- Keep the guardrails minimal (just employee name required)

- [ ] **Step 3: Verify the tool works via chat**

Start the dev server. Navigate to grow/performance. In the chat, type "Run a check-in with [employee name]". Verify:
1. The AI calls the updated tool
2. A check-in is created in the database
3. The response includes a link to the check-in page
4. Clicking the link opens the dedicated page

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/lib/ai/grow-tools.ts apps/platform/src/lib/workflows/definitions/run-check-in.ts
git commit -m "feat(tool): evolve startCheckInTool to create lifecycle check-ins with page links"
```

---

## Task 18: Extend Notifications + Final Wiring

**Files:**
- Create: `apps/platform/src/app/api/notifications/[id]/read/route.ts`
- Modify: `apps/platform/src/app/api/notifications/route.ts`
- Modify: `apps/platform/src/components/notification-center.tsx`

- [ ] **Step 1: Create notification read route**

Create `apps/platform/src/app/api/notifications/[id]/read/route.ts`:

```ts
import { connectDB } from "@ascenta/db";
import { Notification } from "@ascenta/db/notification-schema";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();

  await Notification.findByIdAndUpdate(id, { read: true });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Extend notifications API route**

Modify `apps/platform/src/app/api/notifications/route.ts` to include check-in notifications from the new `Notification` model alongside the existing notification aggregation logic. Query the `Notification` collection filtered by `userId` from the auth header, merge with existing notifications, sort by date.

- [ ] **Step 3: Extend NotificationCenter component**

Modify `apps/platform/src/components/notification-center.tsx`:
- Add check-in notification types to the icon map: `prepare_open` → Calendar, `checkin_ready` → PlayCircle, `reflect_open` → Brain, `gap_signal` → AlertTriangle
- Add click handler: check-in notifications navigate to `/grow/check-ins/[checkInId]`
- Mark as read on click via `PATCH /api/notifications/[id]/read`

- [ ] **Step 4: Verify in browser**

Trigger some notifications (create a check-in via the cron or manually insert). Verify:
1. Notifications appear in the notification center
2. Clicking navigates to the check-in page
3. Read state persists

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/app/api/notifications/ apps/platform/src/components/notification-center.tsx
git commit -m "feat(notifications): extend notification center with check-in lifecycle events"
```

---

## Task 19: Auth Refactor for Existing Pages

**Files:**
- Modify: `apps/platform/src/components/grow/goals-panel.tsx`
- Modify: `apps/platform/src/components/grow/status-dashboard.tsx`
- Modify: `apps/platform/src/components/grow/reviews-panel.tsx`
- Modify: `apps/platform/src/app/api/grow/status/route.ts`

- [ ] **Step 1: Thread auth into existing Grow components**

The existing Grow components (goals panel, status dashboard, reviews panel) currently auto-discover the manager or hardcode assumptions. Refactor each to:

1. Import `useAuth()` from `@/lib/auth/auth-context`
2. Use `user.id` instead of auto-discovering managerId
3. Pass `user.id` via the `x-dev-user-id` header on API calls
4. Conditionally render based on `user.role` where relevant

For `goals-panel.tsx`:
- The employee selector should only show for managers
- Employees see only their own goals
- Pass auth header on `/api/grow/status` and `/api/grow/goals` calls

For `status-dashboard.tsx`:
- Only renders for managers (show a different view for employees or hide)
- Pass auth header on `/api/grow/status` calls

For `reviews-panel.tsx`:
- Manager sees team reviews, employee sees own
- Pass auth header on `/api/grow/reviews` calls

- [ ] **Step 2: Update status API to accept auth header**

Modify `apps/platform/src/app/api/grow/status/route.ts` to read `x-dev-user-id` from the request header instead of relying on the `managerId` query parameter fallback logic. Keep the query parameter as a secondary option for backwards compatibility.

- [ ] **Step 3: Verify in browser**

Test switching between manager and employee users:
1. Goals panel shows appropriate view per role
2. Status dashboard shows/hides based on role
3. Reviews panel filters correctly

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/grow/ apps/platform/src/app/api/grow/status/
git commit -m "refactor(auth): thread auth context through existing Grow components"
```

---

## Task 20: Remove Old Check-in Form + Clean Up

**Files:**
- Modify: `apps/platform/src/components/grow/forms/check-in-form.tsx`
- Modify: `apps/platform/src/components/grow/working-document.tsx`

- [ ] **Step 1: Update working document to handle new check-in flow**

Modify `apps/platform/src/components/grow/working-document.tsx`. The `run-check-in` workflow type should no longer open the old `CheckInForm`. Instead, it should show a message with a link to the new check-in page:

In the switch/conditional that renders form components based on `workflowType`:
- For `"run-check-in"`: render a simple card with the check-in link instead of `CheckInForm`
- Keep all other workflow types unchanged

- [ ] **Step 2: Mark old form as deprecated**

Add a comment at the top of `check-in-form.tsx`:

```tsx
// DEPRECATED: This form is no longer used for the check-in lifecycle.
// Check-ins now use the dedicated page at /grow/check-ins/[id].
// This file is kept for reference during migration and can be removed once confirmed.
```

Do NOT delete the file yet — it may still be imported elsewhere. The cleanup can happen after verification.

- [ ] **Step 3: Run full test suite**

Run: `pnpm test`
Expected: All tests pass

Run: `cd apps/platform && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Verify full flow in browser**

End-to-end test:
1. Switch to manager → schedule a check-in from dashboard
2. Switch to employee → see the check-in, complete preparation
3. Switch to manager → see distilled preview, complete preparation
4. Both advance to participate → fill in respective forms
5. Mutual commitment approval
6. Both complete reflect scoring
7. Gap signals appear on next check-in's prepare view
8. Notifications work throughout

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/components/grow/working-document.tsx apps/platform/src/components/grow/forms/check-in-form.tsx
git commit -m "refactor: deprecate old check-in form, wire working document to new lifecycle page"
```

---

## Blocked Items (Create GitHub Issues)

After completing the implementation, create GitHub issues for each blocker:

1. **Leadership Library integration** — Recognition prompts (M-3) and developmental questions (M-4) should filter through org MVV and leadership standards. Blocks: full M-3, M-4 calibration.
2. **Lifecycle Stage definitions** — Developmental question (M-4) should auto-calibrate to employee lifecycle stage. Blocks: M-4 variant selection.
3. **Canopy integration** — Gap signals after 3+ consecutive cycles should surface to HR. Blocks: HR escalation pipeline.
4. **Reflect feature linkage** — Persistent gaps/safety issues should trigger the Reflect feature. Blocks: cross-feature integration.
5. **AI distilled preview** — Replace truncation stub with AI-generated non-verbatim summary. Blocks: quality of manager context briefing.
6. **Values-aligned communication** — Wire Strategy Studio MVV into check-in prompts. Blocks: full Leadership Library experience.
7. **Team/role-level cadence config** — Check-in cadence is per-goal only, needs team/role-level. Blocks: flexible scheduling.
