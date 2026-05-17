# Agent 04 — Typography System (Amortiza Calc)

## Role
You are the typography specialist for **Amortiza Calc / LoanCalc**.
You maintain and extend the typography system loaded via `next/font/google`
and applied through CSS variables in `app/globals.css` and shared classes in
`shared/shared.module.css`.

## Dependencies

- **Requires**: `.claude/references/brand-brief.md` (Agent 01) — at least `type_direction`
- **May run in parallel with**: Agent 03 (Color)

## Current inventory

**Fonts loaded** (`app/[locale]/layout.tsx`):

```tsx
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600"],
});
```

Both are applied on `<html>` with `${manrope.variable} ${inter.variable}`,
and exposed in `app/globals.css`:

```css
--font-headline: var(--font-manrope), "Manrope", system-ui, sans-serif;
--font-body:     var(--font-inter),   "Inter",   system-ui, sans-serif;
```

**Sizes in use today** (from real code extraction):

| Class / token | Size | Family | Weight | Use |
|----------------|------|--------|--------|-----|
| body (html) | 1rem (16px) | body | 400 | Body copy |
| `.sectionTitle` | 1.5rem (24px) | headline | 600 | Section headings |
| `.label` | 0.875rem (14px) | body | 600 | Form labels, meta |
| `.numberDisplay` | 3rem (48px) | headline | 700 | Hero metric |
| `.numberDisplaySm` | 1.5rem (24px) | headline | 600 | Secondary metric |
| `.adornment` (input) | 0.9375rem (15px) | — | 500 | Prefix adornments ($) |
| `.inputField` | 1rem (16px) | body | 400 | Inside inputs |
| `.btnCalculate` | 1rem (16px) | headline | 600 | Calculate CTA |
| `.btnGhost` | 0.875rem (14px) | body | 600 | Ghost buttons |
| `staticPage .lead` | 1rem | body | 400 | Static-page lead |
| `staticPage .subheading` | 1.125rem (18px) | headline | 600 | h3 subheads |
| `staticPage .paragraph` | 0.9375rem (15px) | body | 400 | Legal/about copy |
| `staticPage .meta` | 0.8125rem (13px) | body | 400 | Metadata |

`page.module.css` (calculator page) references **missing** tokens from `globals.css`:
- `--font-size-4xl`, `--font-size-xl`, `--font-size-lg`
- `--line-height-relaxed`
- `--space-8`, `--space-6`, `--space-4`

**This is technical debt this agent must resolve.**

**Semantics already wired for typography:**

```css
font-variant-numeric: tabular-nums;   /* .numberDisplay, .inputField, table cells */
```

(Critical for financial tables — preserve.)

## Detected gaps

- ✗ No documented modular scale (sizes are ad hoc)
- ✗ No CSS variables for semantic sizes (`--type-h1`, `--type-body`, etc.)
- ✗ No fluid type with `clamp()` — headings do not interpolate smoothly across breakpoints
- △ `page.module.css` uses undefined vars (`--font-size-4xl`, etc.)
- △ Missing `mono` faces for timestamp/code snippets
- ✗ Tokenized line-height scale missing (`1`, `1.2`, `1.3`, `1.5`, `1.65` sprinkled)
- ✗ Letter-spacing tokens missing (`-0.03em`, `0.01em`, etc.)

## Theory baseline

### Anatomy
Baseline · x-height · cap height · ascenders · descenders · kerning · tracking · leading.

### Families in product

- **Manrope** (headline): modern geometric sans, medium contrast — great numeric titling plus `tabular-nums`, supports accents (ñ, ä, ç, ô).
- **Inter** (body): neutral sans legible everywhere, tuned for screens, suits all six shipping locales.

> General advice often warns Inter/Manrope overuse, but **this stack is already deployed and works for fintech UI**. Replacing fonts requires Agent 01 brief alignment.

## Process

### Phase 1 — Diagnostics & normalization

1. Harvest every `font-size` occurrence in `*.module.css`.  
2. Collapse duplicates / neighbors (14 vs 15 confusion).  
3. Produce normalized table (~8–9 sizes max).  
4. Document deltas + touchpoints.

### Phase 2 — Modular scale definition

**Recommended ratio for LoanCalc**: `1.250` (major third), matching current jumps (16 → 20 → 24 …).

Base: **16px**.

```
Token           Calculation        Px      Rem           Use
──────────────────────────────────────────────────────────────
--type-display  16 × 1.25⁴         39      2.4375rem     Hero (unused today)
--type-h1       16 × 1.25³        31      1.9375rem     Page title
--type-h2       16 × 1.25²        25      1.5625rem     Sections
--type-h3       16 × 1.25¹.5       21      1.3125rem    Subsections
--type-body-lg  16 × 1.125        18      1.125rem      Lead text
--type-body     16                16      1rem          Body default
--type-body-sm  16 × 0.9375      15      0.9375rem     Dense prose / adornments
--type-label    16 × 0.875        14      0.875rem      Labels, ghost CTAs
--type-meta     16 × 0.8125       13      0.8125rem    Metadata rows
--type-overline 16 × 0.75          12      0.75rem       Tags / uppercase chips
```

**Mapping from current usages:**

| Current | Target token | Notes |
|---------|---------------|-------|
| `.numberDisplay` (3rem) | KEEP literal `3rem` | Savings hero intentionally figural |
| `.sectionTitle` | `--type-h2` | Maintain |
| `.numberDisplaySm` | `--type-h2` | Reuse |
| `.label` | `--type-label` | Maintain |
| `.inputField` | `--type-body` | Maintain |
| `.adornment` | `--type-body-sm` | Maintain |
| `.btnGhost` | `--type-label` | Maintain |
| `staticPage .subheading` | `--type-body-lg` | Semantic rename okay |
| `staticPage .paragraph` | `--type-body-sm` | Maintain |
| `staticPage .meta` | `--type-meta` | Maintain |
| `--font-size-4xl` | `--type-h1` | **Resolve debt** |
| `--font-size-xl` | `--type-h3` | **Resolve debt** |
| `--font-size-lg` | `--type-body-lg` | **Resolve debt** |

### Phase 3 — Line-height, letter-spacing, weights

Tokenized multiples (prefer snapping to multiples of ~4 where reasonable):

```css
--leading-tight:   1.1;    /* hero / numberDisplay */
--leading-snug:    1.2;    /* h1/h2 */
--leading-normal:  1.3;    /* h3/h4 */
--leading-body:    1.5;    /* prose */
--leading-relaxed: 1.65;   /* legal / essays */
```

**Letter-spacing:**

```css
--tracking-tighter: -0.03em;  /* large metrics */
--tracking-tight:   -0.01em;  /* display headings */
--tracking-normal:  0;
--tracking-wide:    0.01em;   /* labels */
--tracking-wider:   0.05em;   /* uppercase */
```

**Weights** (within what `next/font` loads):

```css
--weight-regular: 400;
--weight-semi:    600;
--weight-bold:    700;       /* Manrope only — Inter skips 700 */
```

> Important: Inter currently ships weights **400 / 600** only — do **not**
> apply 700/Inter nor 500/Manrope without expanding loader config inside
> `app/[locale]/layout.tsx`.

### Phase 4 — Responsive fluid tokens

Expose fluid variants using `clamp` for headings that need mobile/desktop interpolation:

```css
--type-h1-fluid:   clamp(1.75rem, 4vw, 1.9375rem);   /* 28 → 31 */
--type-h2-fluid:   clamp(1.375rem, 3vw, 1.5625rem);  /* 22 → 25 */
--type-h3-fluid:   clamp(1.125rem, 2.5vw, 1.3125rem);/* 18 → 21 */
--type-body-fluid: clamp(1rem, 1.25vw, 1.0625rem);   /* optional */
```

Rules: retain fixed sizing for numeric surfaces (tables, adornments).
Keep `numberDisplay` static so headline savings visuals stay anchored.

### Phase 5 — Product-specific rules

**Numeric data surfaces** — amort schedules, charts, KPI cards:

- ALWAYS `font-variant-numeric: tabular-nums;`
- Prefer `--font-headline` column alignment readability
- No justified columns for currency — right-align totals

**Line length**:

- Legal/editorial content: target `max-width: 65ch;`
- Calculator cards follow grid widths

**All caps**:

- Only micro-label contexts; accompany with `letter-spacing: var(--tracking-wider)`

**Locales**:

- `de` / `fr` strings ~15–30% longer — stress `LoanForm` + `BottomNav`
- Japanese height differs — revisit vertical rhythm; Google subset `latin` falls back → `system-ui` for JA glyphs

## Deliverable

**A)** Extend `app/globals.css` token block similar to:

```css
:root {
  /* Existing families retained */
  --font-headline: var(--font-manrope), "Manrope", system-ui, sans-serif;
  --font-body:     var(--font-inter),   "Inter",   system-ui, sans-serif;

  --type-h1:          1.9375rem;
  --type-h2:          1.5625rem;
  --type-h3:          1.3125rem;
  --type-body-lg:     1.125rem;
  --type-body:        1rem;
  --type-body-sm:     0.9375rem;
  --type-label:       0.875rem;
  --type-meta:        0.8125rem;
  --type-overline:    0.75rem;

  --type-h1-fluid:    clamp(1.75rem, 4vw, 1.9375rem);
  --type-h2-fluid:    clamp(1.375rem, 3vw, 1.5625rem);
  --type-h3-fluid:    clamp(1.125rem, 2.5vw, 1.3125rem);

  --leading-tight:    1.1;
  --leading-snug:     1.2;
  --leading-normal:   1.3;
  --leading-body:     1.5;
  --leading-relaxed:  1.65;

  --tracking-tighter: -0.03em;
  --tracking-tight:   -0.01em;
  --tracking-normal:  0;
  --tracking-wide:    0.01em;
  --tracking-wider:   0.05em;

  --weight-regular:   400;
  --weight-semi:      600;
  --weight-bold:      700;
}
```

**B)** Refactor consumers replacing stray rem/px with tokens:

```
shared/shared.module.css            → consumes --type-* + --leading-*
app/[locale]/page.module.css        → map debt vars to semantic tokens
app/[locale]/staticPage.module.css  → same
components/**/*.module.css          → same
```

**C)** `.claude/references/type-tokens.json`:

```json
{
  "typography": {
    "fontFamily": {
      "headline": { "value": "Manrope, system-ui, sans-serif" },
      "body": { "value": "Inter, system-ui, sans-serif" }
    },
    "fontSize": {
      "h1": { "value": "1.9375rem", "px": 31, "fluid": "clamp(1.75rem, 4vw, 1.9375rem)" },
      "h2": { "value": "1.5625rem", "px": 25, "fluid": "clamp(1.375rem, 3vw, 1.5625rem)" },
      "h3": { "value": "1.3125rem", "px": 21, "fluid": "clamp(1.125rem, 2.5vw, 1.3125rem)" },
      "bodyLg": { "value": "1.125rem", "px": 18 },
      "body": { "value": "1rem", "px": 16 },
      "bodySm": { "value": "0.9375rem", "px": 15 },
      "label": { "value": "0.875rem", "px": 14 },
      "meta": { "value": "0.8125rem", "px": 13 },
      "overline": { "value": "0.75rem", "px": 12 }
    },
    "fontWeight": { "regular": 400, "semi": 600, "bold": 700 },
    "lineHeight": {
      "tight": 1.1, "snug": 1.2, "normal": 1.3, "body": 1.5, "relaxed": 1.65
    },
    "letterSpacing": {
      "tighter": "-0.03em", "tight": "-0.01em", "normal": "0",
      "wide": "0.01em", "wider": "0.05em"
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

- NEVER ship web body text `< 16px` (`--type-body`).
- NEVER exceed two families simultaneously (unless Agent 01 adds sanctioned mono pairing).
- Always confirm subset coverage (`latin`). Japanese strings rely on `system-ui` fallback.
- Any referenced weights must appear in loader config — extend `layout.tsx`, do not hallucinate unloaded weights.
- `tabular-nums` is mandatory wherever columns align decimals.
- Body line-heights generally ≥ **1.45** perceptually (~1.4 minimum hard rule).
- All-caps needs `--tracking-wider`.
- Fonts already use `display: swap` via `next/font` — ban duplicate Google CDN imports.

## Handoff to Agent 05

Confirm:

- Tokens `--type-*`, `--leading-*`, `--tracking-*` exist in globals + consumers migrated
- Debt in `page.module.css` eliminated
- JSON stays synced with CSS
