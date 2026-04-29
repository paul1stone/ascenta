# Translation Editing Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow HR users to edit individual translation sections (contributions, behaviors, decision rights) after generation, for both draft and published translations.

**Architecture:** Add inline edit mode to TranslationRolePreview with per-section text editing. Edits are saved via PATCH to the existing `body.roles` endpoint. The panel tracks local edit state and sends the full roles array on save. No schema changes needed.

**Tech Stack:** React state management, existing PATCH API, Tailwind CSS, Lucide icons

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `apps/platform/src/components/plan/translation-role-preview.tsx` | Add edit mode with inline text inputs for each section |
| Modify | `apps/platform/src/components/plan/translations-panel.tsx` | Add edit/save/cancel controls per role, manage edit state, call PATCH API |

---

### Task 1: Add Edit Mode to TranslationRolePreview

**Files:**
- Modify: `apps/platform/src/components/plan/translation-role-preview.tsx`

- [ ] **Step 1: Add edit mode props and state to TranslationRolePreview**

Add `editing`, `onFieldChange` props to the component. When `editing` is true, render inputs instead of static text.

```tsx
// Add to props interface
interface TranslationRolePreviewProps {
  jobTitle: string;
  level: string;
  contributions: Contribution[];
  behaviors: Behavior[];
  decisionRights: DecisionRights;
  accentColor: string;
  editing?: boolean;
  onFieldChange?: (field: string, value: unknown) => void;
}
```

- [ ] **Step 2: Replace static contribution text with editable textareas when editing**

For each contribution, wrap `roleContribution` and `outcomes` in editable textareas when `editing` is true. Use `onFieldChange` to propagate changes up.

```tsx
// Inside the contributions map, replace:
<p className="text-sm text-foreground leading-relaxed">
  {c.roleContribution}
</p>

// With:
{editing ? (
  <textarea
    value={c.roleContribution}
    onChange={(e) => onFieldChange?.(`contributions.${i}.roleContribution`, e.target.value)}
    rows={3}
    className="w-full rounded-lg border px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[--accent] resize-y"
    style={{ "--accent": accentColor } as React.CSSProperties}
  />
) : (
  <p className="text-sm text-foreground leading-relaxed">
    {c.roleContribution}
  </p>
)}
```

Apply same pattern to outcomes (editable list), alignment descriptors, behaviors, and decision rights.

- [ ] **Step 3: Make outcomes editable as a list**

Each outcome becomes an input with add/remove controls:

```tsx
{editing ? (
  <div className="space-y-1.5">
    {c.outcomes.map((o, j) => (
      <div key={j} className="flex gap-1.5">
        <input
          value={o}
          onChange={(e) => {
            const updated = [...c.outcomes];
            updated[j] = e.target.value;
            onFieldChange?.(`contributions.${i}.outcomes`, updated);
          }}
          className="flex-1 rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[--accent]"
          style={{ "--accent": accentColor } as React.CSSProperties}
        />
        <button
          type="button"
          onClick={() => {
            const updated = c.outcomes.filter((_, k) => k !== j);
            onFieldChange?.(`contributions.${i}.outcomes`, updated);
          }}
          className="text-muted-foreground hover:text-destructive text-xs"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
) : (
  <ul className="list-disc list-inside space-y-0.5">
    {c.outcomes.map((o, j) => (
      <li key={j} className="text-sm text-muted-foreground">{o}</li>
    ))}
  </ul>
)}
```

- [ ] **Step 4: Make alignment descriptors editable**

Replace the 3-column grid text with textareas when editing:

```tsx
{(["strong", "acceptable", "poor"] as const).map((lvl) => (
  <div key={lvl} className={cn(/* existing classes */)}>
    <p className="font-semibold capitalize mb-0.5">{lvl}</p>
    {editing ? (
      <textarea
        value={c.alignmentDescriptors[lvl]}
        onChange={(e) => onFieldChange?.(`contributions.${i}.alignmentDescriptors.${lvl}`, e.target.value)}
        rows={3}
        className="w-full rounded border px-2 py-1 text-xs leading-relaxed resize-y bg-white/50 focus:outline-none"
      />
    ) : (
      <p className="leading-relaxed">{c.alignmentDescriptors[lvl]}</p>
    )}
  </div>
))}
```

- [ ] **Step 5: Make behaviors and decision rights editable**

Behaviors: each expectation becomes a textarea.
Decision rights: each list item becomes an input with add/remove.

- [ ] **Step 6: Verify component renders correctly in both modes**

Run dev server, navigate to Strategy Studio > Translations, expand a department. The read-only view should be unchanged.

- [ ] **Step 7: Commit**

```bash
git add apps/platform/src/components/plan/translation-role-preview.tsx
git commit -m "feat(translations): add inline edit mode to TranslationRolePreview"
```

---

### Task 2: Add Edit/Save/Cancel Controls to TranslationsPanel

**Files:**
- Modify: `apps/platform/src/components/plan/translations-panel.tsx`

- [ ] **Step 1: Add edit state management to TranslationsPanel**

Track which translation is being edited and maintain a working copy of roles:

```tsx
const [editingId, setEditingId] = useState<string | null>(null);
const [editRoles, setEditRoles] = useState<Role[]>([]);
const [saving, setSaving] = useState(false);
```

- [ ] **Step 2: Add handleStartEdit, handleCancelEdit, handleSaveEdit functions**

```tsx
function handleStartEdit(translation: TranslationData) {
  setEditingId(translation.id);
  setEditRoles(JSON.parse(JSON.stringify(translation.roles))); // deep copy
}

function handleCancelEdit() {
  setEditingId(null);
  setEditRoles([]);
}

async function handleSaveEdit(id: string) {
  setSaving(true);
  try {
    const res = await fetch(`/api/plan/strategy-translations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roles: editRoles }),
    });
    const data = await res.json();
    if (data.success) {
      setEditingId(null);
      setEditRoles([]);
      fetchTranslations();
    } else {
      setError(data.error ?? "Save failed");
    }
  } catch {
    setError("Failed to save edits");
  } finally {
    setSaving(false);
  }
}
```

- [ ] **Step 3: Add handleFieldChange to update nested role fields**

```tsx
function handleFieldChange(roleIndex: number, field: string, value: unknown) {
  setEditRoles((prev) => {
    const updated = JSON.parse(JSON.stringify(prev));
    const parts = field.split(".");
    let target = updated[roleIndex] as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      target = target[parts[i]] as Record<string, unknown>;
    }
    target[parts[parts.length - 1]] = value;
    return updated;
  });
}
```

- [ ] **Step 4: Add Edit/Save/Cancel buttons to the action bar**

Inside the action buttons `<div>`, add:

```tsx
{(translation.status === "draft" || translation.status === "published") && editingId !== translation.id && (
  <button
    onClick={() => handleStartEdit(translation)}
    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
  >
    <Pencil className="size-3" />
    Edit
  </button>
)}
{editingId === translation.id && (
  <>
    <button
      onClick={() => handleSaveEdit(translation.id)}
      disabled={saving}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-40"
      style={{ backgroundColor: "#22c55e" }}
    >
      {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
      Save
    </button>
    <button
      onClick={handleCancelEdit}
      className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      Cancel
    </button>
  </>
)}
```

Add `Pencil` and `Check` to the Lucide imports.

- [ ] **Step 5: Pass editing state to TranslationRolePreview**

```tsx
{(editingId === translation.id ? editRoles : translation.roles).map((role, i) => (
  <TranslationRolePreview
    key={i}
    jobTitle={role.jobTitle}
    level={role.level}
    contributions={role.contributions}
    behaviors={role.behaviors}
    decisionRights={role.decisionRights}
    accentColor={accentColor}
    editing={editingId === translation.id}
    onFieldChange={(field, value) => handleFieldChange(i, field, value)}
  />
))}
```

- [ ] **Step 6: Test the full edit flow in the browser**

1. Navigate to Strategy Studio > Translations
2. Expand Engineering department
3. Click Edit — fields should become editable
4. Change a role contribution text
5. Click Save — should PATCH and refresh
6. Verify the change persisted
7. Test Cancel — should revert to original

- [ ] **Step 7: Commit**

```bash
git add apps/platform/src/components/plan/translations-panel.tsx
git commit -m "feat(translations): add edit/save/cancel controls for translation editing"
```
