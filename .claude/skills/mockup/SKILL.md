---
name: mockup
description: >
  Generate self-contained HTML mockups for Ascenta feature proposals using the real platform
  design system. Use when the user asks to create a mockup, wireframe, or visual prototype
  for a new feature, UI concept, or design proposal. Triggers on: "create a mockup",
  "mockup this feature", "build a visual for", "make an HTML prototype", "/mockup",
  or any request to visualize a proposed Ascenta feature. Output is a single .html file
  saved to docs/plans/mockups/ that can be opened in any browser.
---

# Ascenta HTML Mockup Generator

Generate self-contained HTML files that visualize proposed Ascenta features using the real platform design system.

## Process

1. **Read the design system reference** at `references/design-system.md` for exact color values, typography, component patterns, and layout structure.
2. **Read the HTML template** at `assets/template.html` for the base structure with the app shell (sidebar, top header, browser frame, annotations).
3. **Identify the section context** — determine which Ascenta section the feature belongs to (Plan, Attract, Launch, Grow, Care, Protect) and set `--accent` to that section's color.
4. **Build the mockup** by customizing the template's main content area with the feature-specific UI.
5. **Save** to `docs/plans/mockups/<feature-name>-mockup.html`.

## Template Customization Guide

The template provides the full app shell. Replace the `{{placeholders}}`:

| Placeholder | What to fill |
|-------------|-------------|
| `{{MOCKUP_TITLE}}` | Feature name (e.g., "Goal Follow-Through: Action Plan") |
| `{{MOCKUP_SUBTITLE}}` | 1-2 sentence description of what the mockup shows |
| `{{SECTION}}` | Section name (Plan, Grow, etc.) |
| `{{ACCENT_COLOR}}` | Section hex color from design-system.md |
| `{{URL_PATH}}` | Fake URL path (e.g., "grow / performance") |
| `{{SIDEBAR_ITEMS}}` | Sidebar nav items — highlight the active section |
| `{{MAIN_CONTENT}}` | The feature-specific content (chat panel, forms, dashboards, etc.) |
| `{{ANNOTATIONS}}` | 2-4 annotation cards explaining key design decisions |

## Sidebar Items

Build sidebar items using real nav categories from `references/design-system.md`. The active category gets:
- `style="border-left-color: {color}; background: {color}20"` on the category item
- Active subpage gets `style="background: {color}18"` and `.active` class
- Category icons: use inline Lucide SVGs colored with the category color

Always include Home at the top, a divider, then 3-5 relevant categories. Only expand sub-items for the active category.

## Common Content Layouts

### Chat + Working Document (50/50 split)
Use for features with AI interaction + a side-panel form. The `.main-content` contains:
- `.chat-panel` (flex: 1) — chat header, messages, input
- `.working-doc-panel` (flex: 1) — floating card with header, scrollable body, footer actions

### Chat Only (full width)
Use for features that are purely conversational. The `.main-content` contains only `.chat-panel` at full width.

### Dashboard / Content View
Use for non-chat features (status dashboards, lists, settings). Build custom content inside `.main-content` using the design tokens.

## Chat Message Format

Follow the real `ChatMessage` component structure exactly:
```html
<div class="message user"> <!-- or "message assistant" -->
  <div class="message-bubble">
    <div class="message-inner">
      <div class="message-avatar">
        <!-- User icon or Bot icon SVG -->
      </div>
      <div class="message-content">
        <div class="message-sender">
          You <!-- or: Ascenta <span class="tool-badge">Tool Name</span> -->
        </div>
        <div class="message-text">
          Message content here. Use <strong> for accent-colored emphasis.
        </div>
        <!-- Optional: .offer-buttons, .field-prompt, etc. -->
      </div>
    </div>
  </div>
</div>
```

## Annotation Cards

Always include 2-4 annotation cards below the browser frame. These explain the design rationale — what the feature does, how it works, and why. Use `.annotation-card-icon.accent` for section-colored icons, `.blue` and `.orange` for variety.

## Quality Checklist

- [ ] Uses exact brand colors from design-system.md (no invented colors)
- [ ] Montserrat for headings/labels, Inter for body text
- [ ] Sidebar matches real nav structure with correct section colors
- [ ] Top header has company avatar + name + icon buttons
- [ ] Chat messages use the real bubble structure (avatar, sender name, border styles)
- [ ] Bot avatar is summit orange, user avatar is deep-blue
- [ ] Bot message border is tinted with section accent color
- [ ] Working document (if used) is a floating card with accent-gradient header
- [ ] File saved to `docs/plans/mockups/`
- [ ] Annotation cards explain the "what" and "why"
- [ ] `<title>` tag set to `Ascenta — {Feature Name}`
- [ ] All styles are inline in `<style>` — no external CSS dependencies (except Google Fonts)
- [ ] Subtle `fadeUp` animation on key content sections
