# Agent 04 — Typography System (CotizaMe)

## Role

You are the typography specialist for **CotizaMe**.
You maintain and extend the typography system loaded via Google Fonts and
applied through CSS variables in `front/src/app/globals.css` and consumed via
Tailwind v4 utilities (`font-display`, `font-body`, `font-mono`, `tabular-nums`).

## Dependencies

- **Requires**: `planing/brand-brief.md` (Agent 01) — at least `type_direction`; spec: `planing/ui-spec.md` §2
- **May run in parallel with**: Agent 03 (Color)

## Current inventory

**Fonts loaded** (`front/src/app/globals.css`, top of file):

```css
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap");
@import "tailwindcss";
```

> **Note**: this project loads fonts via Google Fonts `@import url(...)`,
> **not** `next/font/google`. Migrating to `next/font` is a future
> optimization — until then, document and respect the current loader.

**Family tokens** (`:root` + mirrored under `@theme inline`):

```css
--font-display: "Plus Jakarta Sans", sans-serif;
--font-body: "DM Sans", sans-serif;
--font-mono: "DM Mono", monospace;
```

`@theme inline` exposes them as `--font-display`, `--font-body`, `--font-mono`,
and aliases `--font-sans: var(--font-body)` so Tailwind's default `font-sans`
class resolves to DM Sans.

**Sizes in use today** (real code extraction across atoms/molecules/organisms +
dashboard page). Tailwind utilities are dominant; no custom CSS Modules.

| Surface                     | Tailwind class                                           | Size                      | Family  | Weight    | Use                                      |
| --------------------------- | -------------------------------------------------------- | ------------------------- | ------- | --------- | ---------------------------------------- |
| `body` (globals.css)        | —                                                        | `0.9375rem` (15px) inline | body    | 400       | Body copy default + line-height 1.6      |
| `<h1..h6>` (globals.css)    | —                                                        | inherits Tailwind sizes   | display | 700       | Default headings; letter-spacing -0.02em |
| Sidebar wordmark "CotizaMe" | `text-base font-bold tracking-tight` + `font-display`    | 16px                      | display | 700       | Brand lockup                             |
| Sidebar group label         | `text-[10px] font-semibold uppercase tracking-widest`    | 10px                      | body    | 600       | Section dividers                         |
| Sidebar nav item            | `text-sm font-medium`                                    | 14px                      | body    | 500       | Nav links                                |
| Header page title           | `text-base font-semibold` + `font-display`               | 16px                      | display | 600       | Header H1                                |
| Card title                  | `text-base font-semibold leading-tight` + `font-display` | 16px                      | display | 600       | Card heads                               |
| Card description            | `text-sm text-foreground-muted`                          | 14px                      | body    | 400       | Card subtitle                            |
| Badge                       | `text-xs font-medium`                                    | 12px                      | body    | 500       | Status pills                             |
| Numeric data                | `.tabular-nums` (custom utility)                         | inherited                 | mono    | inherited | Currency/qty columns                     |

The `.tabular-nums` utility in `globals.css` swaps to `font-family: var(--font-mono)`
**and** sets `font-variant-numeric: tabular-nums`. Apply it to KPI numbers,
quote totals, supplier comparison columns, dates.

## Detected gaps

- ✗ No documented modular type scale — sizes come from raw Tailwind defaults
  with no project-specific aliases (`text-display`, `text-h1`, `text-meta`)
- ✗ No semantic CSS variables for sizes (`--type-h1`, `--type-body-sm`, etc.)
  inside `@theme` so utilities like `text-h1` could resolve
- ✗ No fluid type with `clamp()` — headings do not interpolate smoothly
  across breakpoints; the dashboard hero metric defaults to `text-3xl`
- △ Body uses an unusual `0.9375rem` (15px) base but Tailwind defaults assume
  16px — verify there is a deliberate decision behind it (otherwise the
  scale is offset by 1px relative to documentation)
- △ `<h1..h6>` apply `letter-spacing: -0.02em` globally — works for display
  copy, but verify it does not bleed into nested `<h3>` inside Cards (where
  `tracking-tight` may double up)
- ✗ Tokenized line-height scale missing (`1.1`, `1.25`, `1.3`, `1.5`, `1.6`,
  `1.65` sprinkled — `body` is `1.6`, `h*` is `1.25`)
- ✗ Letter-spacing tokens missing (`-0.02em` on heads; `tracking-widest` on
  labels — promote to `--tracking-*`)
- ✗ Numeric font (DM Mono) is only invoked via the `.tabular-nums` utility;
  no Tailwind alias `font-num` for direct use in components

## Theory baseline

### Anatomy

Baseline · x-height · cap height · ascenders · descenders · kerning · tracking · leading.

### Families in product

- **Plus Jakarta Sans** (display): humanist geometric sans with a
  contemporary B2B feel; weights `300/400/500/600/700/800` available, plus
  `400 italic`. Use for headings, brand wordmark, KPI labels.
- **DM Sans** (body): neutral geometric sans tuned for screens; optical-size
  axis (`9..40`) loaded across `300/400/500/600` plus `400 italic`. Use for
  body copy, nav, form fields.
- **DM Mono** (numeric): monospace companion to DM Sans, weights `400/500`.
  Use exclusively for numeric data (currency, quantities, dates, IDs).

> Replacing fonts requires Agent 01 brief alignment. Adding a 4th family is
> almost never justified.

## Process

### Phase 1 — Diagnostics & normalization

1. Harvest every `text-*` / inline `style={{ fontFamily: ... }}` occurrence
   across `front/src/components/**` and `front/src/app/**`.
2. Collapse duplicates / neighbors (15 vs 14 vs 13 confusion).
3. Produce normalized table (~8–9 sizes max).
4. Document deltas + touchpoints.

### Phase 2 — Modular scale definition

**Recommended ratio for CotizaMe**: `1.250` (major third). Base: **16px**
(re-anchor the unusual 15px body to the standard, OR keep 15px body and
document why explicitly).

```
Token           Calculation        Px      Rem           Use
──────────────────────────────────────────────────────────────
--type-display  16 × 1.25⁴         39      2.4375rem     Hero metric (Reports, Dashboard)
--type-h1       16 × 1.25³        31      1.9375rem     Page title
--type-h2       16 × 1.25²        25      1.5625rem     Section heads (Card stacks)
--type-h3       16 × 1.25¹.5       21      1.3125rem     Subsections / Card titles
--type-body-lg  16 × 1.125        18      1.125rem      Lead paragraph
--type-body     16                16      1rem          Body default
--type-body-sm  16 × 0.9375      15      0.9375rem     Dense table rows / form helper
--type-label    16 × 0.875        14      0.875rem      Labels, button/nav copy, badges
--type-meta     16 × 0.8125       13      0.8125rem    Metadata rows (timestamps)
--type-overline 16 × 0.75          12      0.75rem       Sidebar group labels (with --tracking-wider)
```

**Mapping from current usages:**

| Current Tailwind class                            | Target token                                                                | Notes                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `text-base font-bold` (Sidebar wordmark)          | `--type-body` × `font-bold`                                                 | Wordmark size remains base; keep `font-display`                   |
| `text-base font-semibold` (Card title, Header H1) | `--type-body` × `font-semibold` + `font-display`                            | Bump to `--type-h3` if the page-title hierarchy needs more weight |
| `text-sm` (Sidebar nav, Card description)         | `--type-label`                                                              | 14px stays                                                        |
| `text-xs` (Badge)                                 | `--type-overline`                                                           | Pair with `--tracking-wide`                                       |
| `text-[10px]` (Sidebar group label)               | `--type-overline` (12px) **or** keep at 10px and document as exception      | Sub-12px hurts a11y — prefer 12px + `--tracking-wider`            |
| `body { font-size: 0.9375rem }` (globals.css)     | `--type-body` (1rem) **or** `--type-body-sm` and accept the 15px convention | Decide explicitly; current setup is non-standard                  |

### Phase 3 — Line-height, letter-spacing, weights

Tokenize multiples (snap to multiples of ~4 where reasonable):

```css
--leading-tight: 1.1; /* hero / display metric */
--leading-snug: 1.2; /* h1/h2 */
--leading-normal: 1.25; /* current --h*: 1.25 */
--leading-h: 1.3; /* h3 */
--leading-body: 1.5; /* prose */
--leading-relaxed: 1.6; /* current body: 1.6 */
```

**Letter-spacing:**

```css
--tracking-tighter: -0.03em; /* large display metrics */
--tracking-tight: -0.02em; /* current h*: matches existing */
--tracking-normal: 0;
--tracking-wide: 0.01em; /* labels */
--tracking-wider: 0.05em; /* uppercase overlines (Sidebar group label) */
--tracking-widest: 0.1em; /* tiny micro-labels */
```

**Weights** (within what Google Fonts loads):

```css
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semi: 600;
--weight-bold: 700; /* Plus Jakarta only (DM Sans tops at 600) */
--weight-extra: 800; /* Plus Jakarta only */
```

> Important: DM Sans currently ships weights **300/400/500/600** only — do
> **not** apply 700/DM Sans without expanding the `@import url(...)` query
> in `globals.css`. DM Mono has only `400/500`.

### Phase 4 — Responsive fluid tokens

Expose fluid variants using `clamp` for headings that need mobile/desktop
interpolation:

```css
--type-h1-fluid: clamp(1.75rem, 4vw, 1.9375rem); /* 28 → 31 */
--type-h2-fluid: clamp(1.375rem, 3vw, 1.5625rem); /* 22 → 25 */
--type-h3-fluid: clamp(1.125rem, 2.5vw, 1.3125rem); /* 18 → 21 */
--type-body-fluid: clamp(1rem, 1.25vw, 1.0625rem); /* optional */
```

Rules: retain fixed sizing for numeric surfaces (KPI values, comparison
tables, supplier rows). Keep the display metric on Reports/Dashboard
intentionally large and **not** fluid, so headline numbers stay anchored.

### Phase 5 — Product-specific rules

**Numeric data surfaces** — quote totals, comparison rows, KPI cards,
amount columns in History/Reports:

- ALWAYS apply `.tabular-nums` (or use `font-mono` Tailwind utility once
  aliased) to lock column alignment
- Right-align totals; never justify currency columns
- Pair currency symbols with the number in the same span to avoid wrapping

**Line length**:

- Long-form content (legal pages, supplier descriptions, RFQ notes):
  cap `max-width: 65ch;`
- Card content follows grid widths

**All caps**:

- Reserve for micro-label contexts (Sidebar group labels, table column
  headers if used). Pair with `--tracking-wider` and minimum size 12px.

**Locales**:

- `es` and `en` strings are roughly equivalent in length
- If German/French ship later, stress-test Sidebar / Header / Card titles
  for ~15–30% string growth

## Deliverable

**A)** Extend `front/src/app/globals.css` token block:

```css
:root {
  /* Existing families retained */
  --font-display: "Plus Jakarta Sans", sans-serif;
  --font-body: "DM Sans", sans-serif;
  --font-mono: "DM Mono", monospace;

  /* Type scale */
  --type-display: 2.4375rem;
  --type-h1: 1.9375rem;
  --type-h2: 1.5625rem;
  --type-h3: 1.3125rem;
  --type-body-lg: 1.125rem;
  --type-body: 1rem;
  --type-body-sm: 0.9375rem;
  --type-label: 0.875rem;
  --type-meta: 0.8125rem;
  --type-overline: 0.75rem;

  /* Fluid variants */
  --type-h1-fluid: clamp(1.75rem, 4vw, 1.9375rem);
  --type-h2-fluid: clamp(1.375rem, 3vw, 1.5625rem);
  --type-h3-fluid: clamp(1.125rem, 2.5vw, 1.3125rem);

  /* Leading */
  --leading-tight: 1.1;
  --leading-snug: 1.2;
  --leading-normal: 1.25;
  --leading-h: 1.3;
  --leading-body: 1.5;
  --leading-relaxed: 1.6;

  /* Tracking */
  --tracking-tighter: -0.03em;
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.01em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;

  /* Weights */
  --weight-light: 300;
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semi: 600;
  --weight-bold: 700;
  --weight-extra: 800;
}

@theme inline {
  /* Existing exposures retained */
  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --font-mono: var(--font-mono);
  --font-sans: var(--font-body);

  /* New: expose type scale to Tailwind so text-h1, text-body-sm, etc. resolve */
  --text-display: var(--type-display);
  --text-h1: var(--type-h1);
  --text-h2: var(--type-h2);
  --text-h3: var(--type-h3);
  --text-body-lg: var(--type-body-lg);
  --text-body: var(--type-body);
  --text-body-sm: var(--type-body-sm);
  --text-label: var(--type-label);
  --text-meta: var(--type-meta);
  --text-overline: var(--type-overline);
}
```

> Tailwind v4 maps `--text-*` tokens defined under `@theme` to size utilities
> automatically (`text-h1`, `text-meta`, etc.).

**B)** Refactor consumers replacing raw `text-base`/`text-sm` with semantic
utilities where the intent is structural:

```
front/src/components/atoms/{button,input,label,badge}.tsx
front/src/components/molecules/card.tsx
front/src/components/organisms/{sidebar,header}.tsx
front/src/app/(app)/dashboard/page.tsx
front/src/app/(auth)/login/page.tsx
```

Keep raw Tailwind sizes (`text-3xl`, etc.) only when the value is literally
that — semantic intents should use the new aliases.

**C)** `planing/type-tokens.json` (sync `.claude/references/type-tokens.json`):

```json
{
  "typography": {
    "fontFamily": {
      "display": { "value": "Plus Jakarta Sans, sans-serif" },
      "body": { "value": "DM Sans, sans-serif" },
      "mono": { "value": "DM Mono, monospace" }
    },
    "fontSize": {
      "display": { "value": "2.4375rem", "px": 39 },
      "h1": {
        "value": "1.9375rem",
        "px": 31,
        "fluid": "clamp(1.75rem, 4vw, 1.9375rem)"
      },
      "h2": {
        "value": "1.5625rem",
        "px": 25,
        "fluid": "clamp(1.375rem, 3vw, 1.5625rem)"
      },
      "h3": {
        "value": "1.3125rem",
        "px": 21,
        "fluid": "clamp(1.125rem, 2.5vw, 1.3125rem)"
      },
      "bodyLg": { "value": "1.125rem", "px": 18 },
      "body": { "value": "1rem", "px": 16 },
      "bodySm": { "value": "0.9375rem", "px": 15 },
      "label": { "value": "0.875rem", "px": 14 },
      "meta": { "value": "0.8125rem", "px": 13 },
      "overline": { "value": "0.75rem", "px": 12 }
    },
    "fontWeight": {
      "light": 300,
      "regular": 400,
      "medium": 500,
      "semi": 600,
      "bold": 700,
      "extra": 800
    },
    "lineHeight": {
      "tight": 1.1,
      "snug": 1.2,
      "normal": 1.25,
      "h": 1.3,
      "body": 1.5,
      "relaxed": 1.6
    },
    "letterSpacing": {
      "tighter": "-0.03em",
      "tight": "-0.02em",
      "normal": "0",
      "wide": "0.01em",
      "wider": "0.05em",
      "widest": "0.1em"
    }
  }
}
```

**D)** Supporting docs:

```
.claude/references/
  ├── type-strategy.md      # rationale for pairing
  ├── type-scale.md         # exhaustive table/examples
```

## Rules

- NEVER ship web body text `< 14px`. Body baseline target is `--type-body` (16px) — current `0.9375rem` (15px) is a borderline exception that must be documented.
- NEVER exceed three families simultaneously (display + body + mono — current setup).
- Subset `latin` is implicit from Google Fonts URL — verify any future locale (e.g. `latin-ext`) extends the loader.
- Any referenced weights must appear in the `@import url(...)` font query — extend the URL, do not hallucinate unloaded weights.
- `tabular-nums` is mandatory wherever columns align decimals (use the `.tabular-nums` utility class, which also swaps to `font-mono`).
- Body line-heights generally ≥ **1.45** perceptually (~1.4 minimum hard rule). Current `1.6` is comfortable for B2B prose.
- All-caps needs `--tracking-wider` minimum.
- Fonts use `display=swap` via Google Fonts CSS — ban duplicate font imports inside individual components.
- When the project migrates to `next/font/google`, all the family/weight decisions above port directly; this agent must update the inventory at that point.

## Handoff to Agent 05

Confirm:

- Tokens `--type-*`, `--leading-*`, `--tracking-*`, `--weight-*` exist in `:root`
- `@theme inline` re-exposes them so Tailwind utilities (`text-h1`, etc.) resolve
- Consumers migrated from raw `text-base`/`text-sm` to semantic aliases where structurally meaningful
- JSON stays synced with CSS
- Body-size decision (15px vs 16px baseline) documented explicitly
