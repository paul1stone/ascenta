# Ascenta Design System Reference

Extracted from the real platform codebase. Use these exact values in mockups.

## Color Palette

### Brand Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Deep Blue | `#0c1e3d` | Primary text, headings, sidebar collapsed bg |
| Summit Orange | `#ff6b35` | CTA buttons, bot avatar, accent links |
| Summit Hover | `#e85a2a` | Hover state for Summit buttons |
| Glacier | `#f8fafc` | Page background |

### Section Accent Colors
Each nav category has its own accent color. Use the correct one for the page context:
| Section | Hex | CSS var suggestion |
|---------|-----|--------------------|
| Plan | `#6688bb` | Slate blue |
| Attract | `#aa8866` | Warm brown |
| Launch | `#bb6688` | Mauve |
| Grow | `#44aa99` | Teal |
| Care | `#cc6677` | Rose |
| Protect | `#8888aa` | Slate purple |

### Neutral Palette
| Role | Value |
|------|-------|
| Background (glacier) | `#f8fafc` |
| Card / White | `#ffffff` |
| Border | `#e2e8f0` (oklch 0.922) |
| Border Light | `#f1f5f9` |
| Text Primary | `#0c1e3d` (deep-blue) |
| Text Secondary | `#475569` |
| Text Muted | `#94a3b8` |

## Typography

### Fonts
- **Display**: `'Montserrat', sans-serif` — headings, logo, labels. Weights: 500-900.
- **Body**: `'Inter', system-ui, sans-serif` — body text, UI elements. Weights: 300-800.

Google Fonts import:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Scale
| Role | Font | Size | Weight |
|------|------|------|--------|
| Page title | Montserrat | 24-28px | 700 |
| Section header | Montserrat | 14px | 600-700 |
| Sub-header label | Montserrat | 12px | 600, uppercase, tracking 0.06em |
| Tiny label | Montserrat | 10-11px | 600, uppercase, tracking 0.08em |
| Body text | Inter | 14px | 400 |
| Small text | Inter | 13px | 400 |
| Metadata | Inter | 12px | 400-500 |
| Caption | Inter | 11px | 500 |

## Spacing & Sizing

### Key Dimensions
| Element | Value |
|---------|-------|
| Header height | 56px (h-14) |
| Sidebar expanded | 220px |
| Sidebar collapsed | 52px |
| Base radius | 10px (0.625rem) |
| Button height (sm) | 32px |
| Button height (default) | 36px |
| Button height (lg) | 40px |
| Avatar | 32x32px |
| Icon standard | 16px |
| Icon small | 12-14px |

### Border Radius Scale
| Name | Value |
|------|-------|
| sm | 6px |
| md | 8px |
| lg | 10px |
| xl | 14px |
| 2xl | 18px |
| full | 9999px (pills) |

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 30px rgba(0,0,0,0.12);
--shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.06);
```
Deep-blue tinted shadows: `rgba(12, 30, 61, 0.05)` through `rgba(12, 30, 61, 0.15)`.

## Component Patterns

### App Shell Layout
```
┌──────────────────────────────────────────────┐
│ Browser Frame (mockup only)                  │
├────────┬─────────────────────────────────────┤
│        │ Top Header (56px) — company + icons │
│ Side   ├─────────────────────────────────────┤
│ bar    │                                     │
│ (220px)│ Main Content Area                   │
│        │  (chat, forms, dashboards, etc.)    │
│        │                                     │
├────────┴─────────────────────────────────────┤
```

### Sidebar (Real App)
- White background (`#ffffff`), right border
- Logo row: 56px tall, compass icon + "ASCENTA" in Montserrat bold uppercase tracking-wider
- Categories: each with Lucide icon in section color, 3px left border when active, `{color}20` background when active
- Active subcategories: nested under parent, `{color}18` background, semibold text
- Inactive items: `text-muted-foreground`, hover `bg-primary/5`

### Top Header (Real App)
- 56px, white bg, bottom border
- Left: company avatar (32px rounded-md, deep-blue bg, white initials) + company name
- Right: Settings, Notification bell, User avatar icons

### Chat Messages (Real App)
Structure per message:
```
<bubble: rounded-2xl border px-4 py-4>
  <flex gap-3>
    <avatar: 32x32 rounded-lg, colored bg, white icon>
    <content: flex-1>
      <header: sender name (semibold) + optional tool badge>
      <body: markdown or plain text>
      <optional: field prompt blocks, follow-up blocks>
    </content>
  </flex>
</bubble>
```

- **User bubble**: `border-primary/15 bg-primary/[0.03]` (very subtle deep-blue tint)
- **Bot bubble**: `bg-white/80`, border tinted with section accent color: `color-mix(in srgb, {accentColor} 20%, transparent)`
- **User avatar**: deep-blue background, white User icon
- **Bot avatar**: summit orange (`#ff6b35`) background, white Bot icon
- **Sender label**: "You" / "Ascenta", `text-sm font-semibold text-deep-blue`
- **Tool badge**: `rounded-full bg-summit/10 px-2 py-0.5 text-xs font-medium text-summit`

### Chat Input (Real App)
```
<container: rounded-2xl border bg-white shadow-lg>
  <row: flex items-end gap-2 p-2>
    <attach button: 40x40 rounded-xl>
    <textarea: flex-1, min-h 44px, max-h 200px>
    <submit button: 40x40 rounded-xl bg-summit>
  </row>
  <bottom bar: border-t px-2 py-1.5, model selector + hints>
</container>
```

### Working Document Panel (Real App)
Opens as 50% width alongside chat (50/50 split):
- Outer: `rounded-2xl border bg-white/95 shadow-xl backdrop-blur-sm`
- Header: gradient background using accent color (`color-mix(in srgb, {accentColor} 8%, white)` to 4%), bottom border
- Header content: icon in colored box + title in `text-sm font-semibold text-deep-blue` + close button
- Body: scrollable, `px-4 py-4`
- Footer: action buttons (primary + ghost), `border-t px-4 py-3`

### Field Prompt Block (Corrective Actions)
- Container: `rounded-xl border border-border/60 bg-muted/30 p-4`
- Label: `text-sm font-medium`
- Option pills: `rounded-full text-xs` with hover bg
- Inputs: standard bordered inputs + send button

### Buttons
| Variant | Style |
|---------|-------|
| Primary | accent-color bg, white text, shadow |
| Secondary | glacier bg, secondary text, border |
| Ghost | transparent bg, secondary text |
| Destructive | red bg, white text |

## Nav Categories & Sub-Pages

For sidebar mockups, these are the real navigation items:

**Plan** (#6688bb): Strategy Studio, Org Design & Operating Model, Workforce Planning & Analytics, Goals & Operating Rhythm
**Attract** (#aa8866): Requisition & Role Intake, Interview Kits & Scorecards, Debrief & Decision, Offer & Pre-Hire
**Launch** (#bb6688): Day One Ready, 30-60-90 Ramp Plans, Training & Enablement, Access & Equipment
**Grow** (#44aa99): Performance System, Coaching & Corrective Action, Learning & Development, Leadership Library
**Care** (#cc6677): Total Rewards, Benefits Hub, Leave & Benefits Orchestrator
**Protect** (#8888aa): Protected Feedback, Employee Case Management

## Lucide Icons

The app uses Lucide icons throughout. In HTML mockups, use inline SVGs from [lucide.dev](https://lucide.dev). Common patterns:
- `viewBox="0 0 24 24"` `fill="none"` `stroke="currentColor"` `stroke-width="2"` `stroke-linecap="round"` `stroke-linejoin="round"`
- Size via `width` and `height` attributes matching the icon scale above
