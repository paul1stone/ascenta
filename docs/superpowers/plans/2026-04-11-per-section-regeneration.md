# Per-Section Translation Regeneration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow HR to regenerate individual sections (contributions, behaviors, or decisionRights) of a strategy translation for a specific role without regenerating the entire department.

**Architecture:** Add a `regenerateSection` API action to the individual translation PATCH route. Extract the AI generation prompt into section-specific variants in the translation engine. The UI adds per-section "Regenerate" buttons inside the role preview when expanded.

**Tech Stack:** Vercel AI SDK `generateObject`, existing Mongoose schema, React state

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `apps/platform/src/lib/ai/translation-engine.ts` | Add `regenerateRoleSection()` function for per-section AI generation |
| Modify | `apps/platform/src/app/api/plan/strategy-translations/[id]/route.ts` | Add `regenerateSection` action to PATCH handler |
| Modify | `apps/platform/src/components/plan/translation-role-preview.tsx` | Add per-section regenerate buttons |
| Modify | `apps/platform/src/components/plan/translations-panel.tsx` | Wire regenerate callbacks to API |

---

### Task 1: Add regenerateRoleSection to Translation Engine

**Files:**
- Modify: `apps/platform/src/lib/ai/translation-engine.ts`

- [ ] **Step 1: Add the regenerateRoleSection export**

Add this function after `checkTranslationStalenessBatch` and before `generateTranslationForDepartment`:

```typescript
export type TranslationSection = "contributions" | "behaviors" | "decisionRights";

export async function regenerateRoleSection(
  translationId: string,
  roleIndex: number,
  section: TranslationSection,
): Promise<void> {
  await connectDB();

  const translationDoc = await StrategyTranslation.findById(translationId);
  if (!translationDoc) throw new Error("Translation not found");

  const role = translationDoc.roles[roleIndex];
  if (!role) throw new Error(`Role at index ${roleIndex} not found`);

  // Load foundation and strategy context (same as full generation)
  const foundationDoc = await CompanyFoundation.findOne({ status: "published" }).lean();
  if (!foundationDoc) throw new Error("No published foundation found.");
  const foundation = foundationDoc as Record<string, unknown>;

  const department = translationDoc.department as string;
  const strategyGoals = await StrategyGoal.find({
    $or: [
      { scope: "company", status: { $ne: "archived" } },
      { scope: "department", department, status: { $ne: "archived" } },
    ],
  }).lean();

  const mission = (foundation.mission as string) || "";
  const vision = (foundation.vision as string) || "";
  const values = (foundation.values as string) || "";

  const goalsContext = strategyGoals.map((g) => {
    const goal = g as Record<string, unknown>;
    return {
      id: String(goal._id),
      title: goal.title as string,
      description: goal.description as string,
      horizon: goal.horizon as string,
      scope: goal.scope as string,
      rationale: (goal.rationale as string) || "",
    };
  });

  const jobTitle = role.jobTitle as string;
  const level = role.level as string;

  // Resolve AI model
  const availability = checkProviderConfig();
  let modelId: string;
  if (availability.openai) {
    modelId = AI_CONFIG.defaultModels.openai;
  } else if (availability.anthropic) {
    modelId = AI_CONFIG.defaultModels.anthropic;
  } else {
    throw new Error("No AI provider configured.");
  }

  const baseContext = `MISSION: ${mission}\nVISION: ${vision}\nCORE VALUES: ${values}\n\nSTRATEGIC PRIORITIES:\n${goalsContext.map((g) => `- [${g.horizon}] [${g.scope}] "${g.title}": ${g.description}`).join("\n")}\n\nRole: ${jobTitle} (${level}) in ${department}`;

  if (section === "contributions") {
    const result = await generateObject({
      model: getModel(modelId),
      schema: z.object({
        contributions: z.array(contributionOutputSchema),
      }),
      system: `You are regenerating ONLY the contribution statements for a specific role. Keep the same quality standards: mission-anchored contributions, measurable outcomes, concrete alignment descriptors.\n\n${baseContext}`,
      prompt: `Regenerate contribution statements for ${jobTitle} (${level}) for EACH of these goals:\n${goalsContext.map((g) => `- ID: ${g.id}, Title: "${g.title}" (${g.horizon}, ${g.scope})`).join("\n")}`,
    });
    translationDoc.roles[roleIndex].contributions = result.object.contributions;
  } else if (section === "behaviors") {
    const result = await generateObject({
      model: getModel(modelId),
      schema: z.object({
        behaviors: z.array(behaviorOutputSchema),
      }),
      system: `You are regenerating ONLY the behavioral expectations for a specific role. Each behavior must derive from a core value and be observable.\n\n${baseContext}`,
      prompt: `Regenerate behavioral expectations for ${jobTitle} (${level}). Create one behavior per core value.`,
    });
    translationDoc.roles[roleIndex].behaviors = result.object.behaviors;
  } else if (section === "decisionRights") {
    const result = await generateObject({
      model: getModel(modelId),
      schema: z.object({
        decisionRights: decisionRightsOutputSchema,
      }),
      system: `You are regenerating ONLY the decision rights for a specific role. Calibrate to role level: executives decide broadly, managers within teams, ICs within their scope.\n\n${baseContext}`,
      prompt: `Regenerate decision rights for ${jobTitle} (${level}). Produce canDecide, canRecommend, and mustEscalate lists.`,
    });
    translationDoc.roles[roleIndex].decisionRights = result.object.decisionRights;
  }

  await translationDoc.save();
}
```

- [ ] **Step 2: Add needed imports at top of translation-engine.ts**

```typescript
import { z } from "zod";
import {
  contributionOutputSchema,
  behaviorOutputSchema,
  decisionRightsOutputSchema,
} from "@/lib/validations/strategy-translation";
```

Check if `z` and the output schemas are already imported. Only add missing ones.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/ai/translation-engine.ts
git commit -m "feat(translations): add regenerateRoleSection for per-section AI regeneration"
```

---

### Task 2: Add regenerateSection Action to PATCH Route

**Files:**
- Modify: `apps/platform/src/app/api/plan/strategy-translations/[id]/route.ts`

- [ ] **Step 1: Import regenerateRoleSection and TranslationSection**

```typescript
import { regenerateRoleSection, type TranslationSection } from "@/lib/ai/translation-engine";
```

- [ ] **Step 2: Add the regenerateSection handler before the roles update block**

Insert this block after the `action === "archive"` handler (line 81) and before `if (body.roles)`:

```typescript
if (action === "regenerateSection") {
  const { roleIndex, section } = body as {
    roleIndex: number;
    section: TranslationSection;
  };

  if (typeof roleIndex !== "number" || !["contributions", "behaviors", "decisionRights"].includes(section)) {
    return NextResponse.json(
      { success: false, error: "roleIndex (number) and section ('contributions' | 'behaviors' | 'decisionRights') are required" },
      { status: 400 },
    );
  }

  await regenerateRoleSection(id, roleIndex, section);

  return NextResponse.json({
    success: true,
    message: `Regenerated ${section} for role at index ${roleIndex}.`,
  });
}
```

- [ ] **Step 3: Update the error message for invalid actions**

```typescript
return NextResponse.json(
  { success: false, error: "Invalid action. Use 'publish', 'archive', 'regenerateSection', or provide 'roles'." },
  { status: 400 },
);
```

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/app/api/plan/strategy-translations/[id]/route.ts
git commit -m "feat(api): add regenerateSection action to translation PATCH route"
```

---

### Task 3: Add Per-Section Regenerate Buttons to UI

**Files:**
- Modify: `apps/platform/src/components/plan/translation-role-preview.tsx`
- Modify: `apps/platform/src/components/plan/translations-panel.tsx`

- [ ] **Step 1: Add onRegenerateSection prop to TranslationRolePreview**

```typescript
interface TranslationRolePreviewProps {
  // ... existing props
  onRegenerateSection?: (section: "contributions" | "behaviors" | "decisionRights") => void;
  regeneratingSection?: string | null;
}
```

- [ ] **Step 2: Add regenerate buttons to each section header in TranslationRolePreview**

Before the contributions map:
```tsx
{onRegenerateSection && (
  <div className="flex items-center justify-between mb-2">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      Role Contributions
    </p>
    <button
      onClick={() => onRegenerateSection("contributions")}
      disabled={!!regeneratingSection}
      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
    >
      {regeneratingSection === "contributions" ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <RefreshCw className="size-3" />
      )}
      Regenerate
    </button>
  </div>
)}
```

Add similar buttons before the Behavioral Expectations section and Decision Rights section.

Import `Loader2` and `RefreshCw` from lucide-react.

- [ ] **Step 3: Add handleRegenerateSection to TranslationsPanel**

```typescript
const [regeneratingSection, setRegeneratingSection] = useState<{
  translationId: string;
  roleIndex: number;
  section: string;
} | null>(null);

async function handleRegenerateSection(
  translationId: string,
  roleIndex: number,
  section: "contributions" | "behaviors" | "decisionRights",
) {
  setRegeneratingSection({ translationId, roleIndex, section });
  try {
    const res = await fetch(`/api/plan/strategy-translations/${translationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "regenerateSection", roleIndex, section }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.error ?? "Regeneration failed");
    }
    await fetchTranslations();
  } catch {
    setError("Section regeneration failed");
  } finally {
    setRegeneratingSection(null);
  }
}
```

- [ ] **Step 4: Pass regeneration props to TranslationRolePreview**

```tsx
<TranslationRolePreview
  key={i}
  jobTitle={role.jobTitle}
  level={role.level}
  contributions={role.contributions}
  behaviors={role.behaviors}
  decisionRights={role.decisionRights}
  accentColor={accentColor}
  onRegenerateSection={(section) => handleRegenerateSection(translation.id, i, section)}
  regeneratingSection={
    regeneratingSection?.translationId === translation.id &&
    regeneratingSection?.roleIndex === i
      ? regeneratingSection.section
      : null
  }
/>
```

- [ ] **Step 5: Test per-section regeneration in the browser**

1. Navigate to Strategy Studio > Translations
2. Expand Engineering
3. On the Software Engineer role, click "Regenerate" next to "Role Contributions"
4. Verify the spinner shows during generation
5. Verify contributions are replaced with new AI output
6. Verify behaviors and decision rights are unchanged
7. Test regenerating behaviors and decision rights separately

- [ ] **Step 6: Commit**

```bash
git add apps/platform/src/components/plan/translation-role-preview.tsx apps/platform/src/components/plan/translations-panel.tsx
git commit -m "feat(translations): add per-section regenerate buttons to role previews"
```
