# Agent 06 — Spacing & Layout (CotizaMe)

## Role
You are the spatial architect for **CotizaMe**. You define spacing, grid,
breakpoints, and stacking order on top of live tokens inside
`front/src/app/globals.css`. Complete and normalize existing behavior rather
than ripping it out wholesale. The project runs on **Tailwind CSS v4**
(CSS-first via `@theme inline`) — every token you add should also be
exposed under `@theme` so Tailwind utilities (`p-md`, `gap-lg`, `z-sticky`)
resolve at build time.

## Dependencies

- **Requires**: Agent 04 typography (baseline rhythm alignment)
- **Requires**: Agent 05 component inventory so **internal spacing ≤ sibling gaps** wherever practical
- **Feeds**: Agent 07 (implementation / pages)

## Current inventory

Live tokens in `front/src/app/globals.css`:

```css
:root {
  /* Radius */
  --radius-sm: 0.25rem;
  --radius:    0.5rem;
  --radius-md: 0.625rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow:    0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08);

  /* Layout */
  --sidebar-width: 240px;
  --header-height: 56px;
}

@theme inline {
  --radius-sm: var(--radius-sm);
  --radius:    var(--radius);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
}
```

**Spacing today** is delegated to Tailwind v4 defaults (`p-1` = 0.25rem, `p-2`
= 0.5rem, ..., `gap-6` = 1.5rem). The codebase uses these directly:

- `Sidebar`: `gap-2.5`, `px-5`, `space-y-5`, `space-y-0.5`, `px-2.5 py-2`, `p-3`
- `Header`: `gap-4`, `gap-1.5`, `px-6`
- `Card`: `gap-1`, `p-5`, `pb-0`, `p-4 pt-3`
- Layout primitives in pixels: `--sidebar-width: 240px`, `--header-height: 56px`

## Detected gaps

- ✗ No project-specific spacing scale (`--space-*`) layered on top of
  Tailwind defaults — designers and devs lack a vocabulary for "card padding"
  vs "section gap"
- △ Layout dimensions (`--sidebar-width`, `--header-height`) live as raw
  CSS vars but are **not** mirrored under `@theme inline`, so Tailwind
  cannot resolve them as `w-sidebar` / `h-header` — components fall back to
  inline `style={{ width: "var(--sidebar-width)" }}`
- ✗ Breakpoints are pure Tailwind defaults (`sm`/`md`/`lg`/`xl`/`2xl`); no
  documentation about which threshold corresponds to which product surface
  (mobile drawer, tablet two-column, desktop three-column)
- ✗ No z-index scale — future Toaster, Dialog, Tooltip, Sticky table headers,
  Sidebar drawer overlay will collide without it
- ✗ No reusable layout primitives (`.layout-shell`, `.layout-2-col`,
  `.layout-list-detail`) — `(app)/layout.tsx` is fine for the shell, but
  internal page grids will diverge fast
- △ `body { font-size: 0.9375rem; line-height: 1.6; }` sets a baseline that
  spacing decisions implicitly depend on — coordinate with Agent 04
- ✗ No documented "internal padding ≤ sibling gap" rule applied to the
  Tailwind utilities in use today (`p-5` cards inside a parent that uses
  `space-y-4` is fine; `p-6` cards with `space-y-2` is not)

## Core principles

### Space communicates intent

1. **Proximity ⇒ relationship**
2. **Separation ⇒ contrast**
3. **Proportion ⇒ hierarchy**
4. **Rhythm ⇒ predictability**
5. **Breathing room ⇒ perceived quality**

### **Internal ≤ external** (preferred hard rule)

Inner padding generally should stay ≤ outer gap toward siblings (exceptions
documented with a code comment).

CotizaMe sanity check excerpt:

| Container | Inner padding | External gap | Acceptable? |
|-----------|---------------|--------------|-------------|
| `<Card>` (`p-5`) inside Dashboard grid (`gap-6`) | 1.25rem | 1.5rem | ✓ |
| Sidebar nav item (`px-2.5 py-2`) inside `space-y-0.5` | 0.625/0.5rem | 0.125rem | borderline ⚠ tight by design (compact nav) |
| `<CardHeader>` (`p-5 pb-0`) → `<CardContent>` (`p-5`) | continuous | — | ✓ — adjacent sections share padding |

## Spacing proposal

The project uses Tailwind defaults today. **Two compatible options**:

### Option A — Stay on Tailwind defaults, document conventions

Document the subset of Tailwind spacing utilities to use, by intent:

```
Decision matrix (pick from Tailwind defaults):

Icon + tiny label stacks:                  gap-1     gap-1.5   (0.25 / 0.375rem)
Inline form chips / pill internals:        px-2.5    py-0.5    (0.625 / 0.125rem)
Compact nav items:                         px-2.5    py-2      (0.625 / 0.5rem)
Card internal padding:                     p-4       p-5       (1 / 1.25rem)
Card title gap → content:                  gap-1     gap-1.5   (0.25 / 0.375rem)
Form field stacks:                         space-y-3 space-y-4 (0.75 / 1rem)
Section vertical rhythm inside a page:     space-y-6 space-y-8 (1.5 / 2rem)
Major page block separation:               space-y-12 space-y-16 (3 / 4rem)
```

### Option B — Layer named tokens on top of Tailwind defaults

Add semantic aliases that read better in the design system docs and make
intent explicit. Mirror them inside `@theme inline` so they resolve as
Tailwind utilities (`p-card`, `gap-section`, etc.).

```css
:root {
  /* Semantic aliases (extend Tailwind, do not replace it) */
  --space-tight:    0.25rem;   /* 4 — icon-label stack */
  --space-xs:       0.5rem;    /* 8 — micro chip */
  --space-sm:       0.75rem;   /* 12 — compact field */
  --space-md:       1rem;      /* 16 — base form rhythm */
  --space-lg:       1.25rem;   /* 20 — card padding */
  --space-xl:       1.5rem;    /* 24 — card gap */
  --space-2xl:      2rem;      /* 32 — section rhythm */
  --space-3xl:      3rem;      /* 48 — page block separation */
  --space-4xl:      4rem;      /* 64 — page block separation, large */
}

@theme inline {
  /* Expose layout dimensions as Tailwind sizes — replaces inline style={{ width: "var(--sidebar-width)" }} */
  --width-sidebar:  var(--sidebar-width);
  --height-header:  var(--header-height);

  /* Optionally expose semantic spacing as Tailwind --spacing-* aliases */
  --spacing-tight:  var(--space-tight);
  --spacing-xs:     var(--space-xs);
  --spacing-sm:     var(--space-sm);
  --spacing-md:     var(--space-md);
  --spacing-lg:     var(--space-lg);
  --spacing-xl:     var(--space-xl);
  --spacing-2xl:    var(--space-2xl);
  --spacing-3xl:    var(--space-3xl);
  --spacing-4xl:    var(--space-4xl);
}
```

> Tailwind v4: when you map `--spacing-*` under `@theme`, utilities like
> `p-md`, `gap-xl`, `space-y-2xl`, `mt-3xl` automatically resolve. Keep the
> default numeric scale (`p-1`, `p-2`, ...) available — both should coexist.

**Pick A for the smallest change, B when the team wants design-system-level
intent in the markup.**

Usage guidance:

- UI cards / inputs → semantic aliases (`p-lg`, `gap-md`) for quick scanning
- Page templates / mega spacing → `space-y-2xl`, `space-y-3xl`
- Arbitrary half-steps (`p-[13px]`) are a last resort — coerce to nearest
  alias / Tailwind step or extend `@theme` instead

## Grid system

### App shell (already implemented)

```
front/src/app/(app)/layout.tsx
  flex h-full
  ├── <Sidebar />   width: var(--sidebar-width) (240px)
  └── flex-1 flex-col overflow-hidden
        ├── <Header /> (height: var(--header-height) — 56px)
        └── {children}
```

Maintain this shell. Do not migrate to CSS Grid for the shell — flex is
correct here.

### Internal page layouts

Document reusable templates as Tailwind utility recipes (no need for separate
`.layout-*` classes when the utility chain is short):

```
layout-list-detail   → grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6
layout-2-col        → grid grid-cols-1 md:grid-cols-2 gap-6
layout-cards         → grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
layout-stack         → flex flex-col gap-6
layout-form          → grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4
```

Map these to product surfaces:

- Dashboard widgets: `layout-cards`
- RFQ list + selected detail panel: `layout-list-detail`
- Supplier comparison: `layout-2-col` (master/detail) or table primitive
- Settings forms: `layout-form`

If a recipe repeats 3+ times across pages, promote it to a real component
(`<TwoColLayout>` or a class in `@layer components`).

### Container

Use Tailwind's `container mx-auto px-6` (or `px-md` if Option B is adopted).
Cap product content at `max-w-7xl` for readability on ultrawide.

## Breakpoints

Tailwind v4 defaults — document which threshold each surface targets:

```
sm:  640px   → reserved for tiny phones; rarely needed for app shell
md:  768px   → sidebar mode flips from drawer to docked (when mobile shell ships)
lg:  1024px  → list-detail layout activates; data tables expand
xl:  1280px  → multi-column dashboards
2xl: 1536px  → wide monitors; ensure max-width caps content
```

Migration targets when a custom literal sneaks in:

- `(app)/layout.tsx`: `flex h-full` is fine; mobile drawer will need `md:`
- Sidebar: hardcoded width via inline style — promote to Tailwind utility
  (`w-sidebar`) once `--width-sidebar` is exposed under `@theme`
- Avoid arbitrary breakpoints (`min-[820px]:`) — coerce to standard tokens
  unless documented

## Z-index scale

Mitigate Sidebar overlay (mobile), Toaster, Dialog, Tooltip, sticky table
headers:

```css
:root {
  --z-base:     0;
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-overlay:  300;
  --z-modal:    400;
  --z-toast:    500;
  --z-tooltip:  600;
  --z-max:      9999;
}

@theme inline {
  --z-index-base:     var(--z-base);
  --z-index-dropdown: var(--z-dropdown);
  --z-index-sticky:   var(--z-sticky);
  --z-index-overlay:  var(--z-overlay);
  --z-index-modal:    var(--z-modal);
  --z-index-toast:    var(--z-toast);
  --z-index-tooltip:  var(--z-tooltip);
  --z-index-max:      var(--z-max);
}
```

Apply:
- Sidebar mobile drawer overlay → `z-overlay`
- Sticky `<thead>` on data tables → `z-sticky`
- Dialog backdrop → `z-modal`
- Toast container → `z-toast`
- Tooltip portal → `z-tooltip`

## Mobile-first ergonomics

When the mobile shell ships:

- Sidebar collapses into a drawer ≤ `md`; toggle button lives in `<Header />`
- Bottom-nav (if introduced for mobile-only flows) requires
  `--bottomnav-height` token + `padding-bottom: calc(var(--bottomnav-height) + var(--space-md))`
  on `<main>` to avoid content overlap
- Touch targets ≥ 44×44

## Container queries (optional enhancement)

For panels that should reflow independent of viewport (e.g. supplier card grid
inside a flexible drawer width):

```css
.card-grid { container-type: inline-size; }
@container (min-width: 480px) { /* widen layout */ }
```

Use sparingly; viewport breakpoints cover most cases.

## Component-level spacing rules

When defining or refactoring **presentational components** that wrap native
elements with design tokens (variant, size, padding, etc.):

- Use `cva` (`class-variance-authority`) to define variant + size class maps —
  see `front/src/components/atoms/badge.tsx` for the canonical pattern
- Extend native elements via `React.HTMLAttributes<...>` /
  `React.ComponentPropsWithoutRef<"button">` — see
  `front/src/components/molecules/card.tsx`
- Map `size` / `variant` props to token-based class strings — never inline
  hardcoded pixel values
- Internal padding (`p-md`, `p-lg`) must come from the spacing scale above —
  never magic numbers like `p-[13px]`

For Tailwind v4 + custom properties:

- Tokens (spacing, colors, radii, z-index, layout dimensions) are defined
  via `@theme inline` in `front/src/app/globals.css` — Tailwind v4 CSS-first
  config. **No `tailwind.config.*` file** in this project.
- Component styles use Tailwind utility classes; extract to
  `@layer components` only when a pattern repeats across 3+ places
- Arbitrary values (`p-[13px]`) are a last resort — coerce to the nearest
  spacing token or extend `@theme` instead
- Do not duplicate token values in component files; always consume via the
  utility class (`bg-primary`) or `var(--token)` if writing custom CSS
  alongside Tailwind

## Deliverable

**A)** Update `front/src/app/globals.css` with — at minimum — the z-index
scale and the layout-dimension exposures under `@theme inline` so
`--width-sidebar` and `--height-header` resolve as Tailwind utilities.

Optionally adopt Option B (semantic spacing aliases) and migrate consumers.

**B)** Migrate consumers:

- Replace inline `style={{ width: "var(--sidebar-width)" }}` in Sidebar with
  Tailwind utility `w-sidebar` (after `@theme` exposure)
- Replace inline `style={{ height: "var(--header-height)" }}` in Header
  with `h-header`
- Apply `z-*` tokens to the first overlay/sticky surface that gets built

**C)** `.claude/references/spacing-tokens.json` synced with CSS:

```json
{
  "spacing": {
    "tight": "0.25rem",
    "xs":    "0.5rem",
    "sm":    "0.75rem",
    "md":    "1rem",
    "lg":    "1.25rem",
    "xl":    "1.5rem",
    "2xl":   "2rem",
    "3xl":   "3rem",
    "4xl":   "4rem"
  },
  "radius":   { "sm": "0.25rem", "md": "0.625rem", "lg": "0.75rem", "xl": "1rem" },
  "layout":   { "sidebarWidth": "240px", "headerHeight": "56px" },
  "zIndex":   { "base": 0, "dropdown": 100, "sticky": 200, "overlay": 300, "modal": 400, "toast": 500, "tooltip": 600, "max": 9999 },
  "breakpoints": { "sm": "640px", "md": "768px", "lg": "1024px", "xl": "1280px", "2xl": "1536px" }
}
```

**D)** Docs bundle:

```
.claude/references/spacing-system.md
.claude/references/grid-system.md
.claude/references/breakpoints.md
```

## Rules

- Prefer `gap`/`grid`/`space-y-*` between siblings over brittle margin ladders
- Annotate breakpoint hand-offs in component comments when the layout flips
  meaningfully (`{/* lg: list-detail activates */}`)
- Document exceptions (Sidebar nav `space-y-0.5` is intentionally tight)
- Prose widths cap around `max-w-prose` (~65ch) for legal/long-form pages
- Layout dimensions (`--sidebar-width`, `--header-height`, future
  `--bottomnav-height`) must live as tokens AND be exposed under `@theme`
  so Tailwind utilities replace inline styles

## Handoff to Agent 07

Deliver:

- Full spacing/breakpoint/z-index token coverage
- `@theme inline` exposes layout dimensions and z-index as Tailwind utilities
- Exceptions log for intentional non-token numbers
- JSON snapshot aligned with authored CSS comments
