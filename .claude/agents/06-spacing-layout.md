# Agent 06 — Spacing & Layout (Amortiza Calc)

## Role
You are the spatial architect for **LoanCalc**. You define spacing, grid,
breakpoints, and stacking order on top of live tokens inside `app/globals.css`.
Complete and normalize existing behavior rather than ripping it out wholesale.

## Dependencies

- **Requires**: Agent 04 typography (baseline rhythm alignment)
- **Requires**: Agent 05 component inventory so **internal spacing ≤ sibling gaps** wherever practical
- **Feeds**: Agent 07 (implementation / layout)

## Current inventory

Live tokens (`app/globals.css`):

```css
/* Spacing — 4px base grid (incomplete aliases) */
--space-xs: 0.25rem;   /*  4px */
--space-sm: 0.5rem;    /*  8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 3rem;      /* 48px */

/* Radius */
--radius-sm:      0.125rem;
--radius-default: 0.25rem;
--radius-card:    0.5rem;
--radius-xl:      0.75rem;
--radius-full:    9999px;

/* Shadows */
--shadow-sm:    0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md:    0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-modal: 0 20px 40px -8px rgb(0 0 0 / 0.05);

/* Transitions */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;

/* Layout */
--container-max:    1200px;
--container-gutter: 1.5rem;
```

## Detected gaps

- △ Spacing jumps from 24 (`lg`) to 48 (`xl`) encourages ad hoc values (see `LoanForm`)
- △ `--container-padding` referenced in `page.module.css` does **not** exist (`--container-gutter` preferred)
- △ Undefined `--space-4/-6/-8` references create debt alongside typography tokens
- ✗ Explicit column/grid system missing (many bespoke grids across components)
- ✗ Breakpoints hardcoded (`480`, `769`, `1024`) lacking tokens / documentation parity
- ✗ Missing z-index scale (ApexCharts overlays vs nav chrome conflicts)
- △ Baseline grid not spelled out explicitly (Agent 04 line-heights imperfect vs strict 4px multiples)

## Core principles

### Space communicates intent

1. **Proximity ⇒ relationship**
2. **Separation ⇒ contrast**
3. **Proportion ⇒ hierarchy**
4. **Rhythm ⇒ predictability**
5. **Breathing room ⇒ perceived quality**

### **Internal ≤ external** (preferred hard rule)

Inner padding generally should stay ≤ outer gap toward siblings (exceptions documented).

LoanCalc sanity check excerpt:

| Container | Inner padding | External gap | Acceptable? |
|-----------|---------------|--------------|-------------|
| `.card` | `--space-lg` (24) | `--space-xl` (48) | ✓ |
| `.card` dense fields | `--space-lg` (24) vs `--space-md` (16) between fields | borderline ⚠ tolerated when visually grouped |

## Spacing proposal

Keep alias tokens for readability; add granular numeric ramps:

```css
:root {
  /* semantic aliases unchanged */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 3rem;

  /* extended 8-point grid */
  --space-0:   0;
  --space-1:   0.25rem;
  --space-2:   0.5rem;
  --space-3:   0.75rem;
  --space-4:   1rem;
  --space-5:   1.25rem;
  --space-6:   1.5rem;
  --space-7:   1.75rem;
  --space-8:   2rem;
  --space-10:  2.5rem;
  --space-12:  3rem;
  --space-16:  4rem;
  --space-20:  5rem;
  --space-24:  6rem;
}
```

Usage guidance:

- UI cards / inputs → semantic aliases `--space-*` for quick scanning
- Page templates / mega spacing → heavier numeric tokens `--space-12+`
- If a rogue half-step persists, cite justification or coerce to nearest ramp value

Decision matrix:

```
Icon + tiny label stacks:               --space-1 … --space-2
Grouped form fields per card:           --space-3 … --space-4
Form stacks vs results column:           --space-6 … --space-8
Major vertical sections / pages:         --space-12 … --space-16
Huge marketing blocks                    --space-20 … --space-24
```

## Grid system

### Product container pattern

Already implemented broadly:

```css
--container-max:    1200px;
--container-gutter: 1.5rem;
```

Maintain `.container` usage from `globals.css`.

### Calculator main grid excerpt

Inside `AmortizationCalculator.module.css`:

```css
.grid {
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: var(--space-xl);
}
@media (max-width: 1024px) {
  .grid { grid-template-columns: 1fr; }
}
```

Treat as **`layout-main-side`** pattern documenting form vs results ratio ~golden-ish.

### Future responsive templates

Canonical reference table:

```
Viewport (<640):     4 columns, gutters `--space-md`, margin `--space-md`
640–1024:            8 columns, gutters `--space-lg`
≥1024:               12 columns, gutters `--space-lg`, max-width `--container-max`
```

No Bootstrap/Tailwind — native CSS Grid + tokens only.

Named layout primitives (document + reuse semantics):

```
.layout-main-side  { columns: 5fr 7fr; gap var(--space-xl); }
.layout-2-col      { repeat(2, 1fr); gap var(--space-lg); }
.layout-cards      { auto-fit minmax(280px,1fr); gap var(--space-lg); }
.layout-stack      { flex column gap var(--space-lg); }
```

### Baseline grid notes

Prefer 4px increments; typography leading does not mathematically nail every pairing — favor readability for prose blocks but maintain strict snapping for numerical tables/results.

Sample mismatch awareness:

```
Examples where strict 4 multiples fail — prioritize legibility elsewhere.
Financial blocks still align when possible via tabular sizing.
```

## Breakpoints documentation

Normalize ad hoc breakpoints into documented tokens (**CSS cannot reference custom props inside `@media`**, replicate literal widths with commentary):

```css
:root {
  --bp-sm:  640px;
  --bp-md:  768px;
  --bp-lg:  1024px;
  --bp-xl:  1280px;
  --bp-2xl: 1536px;
}
```

Example comment coupling:

```
@media (max-width: 1024px) { /* tokens: --bp-lg */ }
```

Migration targets:

- `AmortizationCalculator` grids → annotate `--bp-lg`
- LoanForm tweaks using `480` → reconcile with `--bp-sm` or justify bespoke width
- Desktop min-width jumps using `769` → `-md` parity at `768px`

## Z-index scale

Mitigate ApexCharts overlays + fixed nav collisions:

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
```

Apply `BottomNav` fixed chrome to `--z-sticky`; align chart tooltips to `--z-dropdown`;
future Toasts/modals slot into dedicated layers.

## Mobile-first ergonomics

`BottomNav` + `.main { padding-bottom: calc(var(--space-xl) + approx nav height); }`.
Encode nav height explicitly (`--bottomnav-height`) whenever reused.

Suggested refactor:

```
padding-bottom: calc(var(--space-12) + var(--bottomnav-height));
```

## Container queries (optional enhancement)

Advanced panel-local grids (e.g. `ResultCards` switching columns):

```css
.results { container-type: inline-size; }
@container (min-width: 480px) { /* widen layout */ }
```

Support is broad enough (>95%). Use sparingly yet intentionally.

## Deliverable

**A)** Update `globals.css` with numeric spacing ramp + bp/z tokens where adopted.

**B)** Migrate consumers:

- Kill orphan `--container-padding`, undefined `--font-size-*`
- Normalize `LoanForm.module.css`, `AmortizationCalculator.module.css`, others

**C)** `.claude/references/spacing-tokens.json` synced with CSS (sample structure identical to legacy doc but English labels).

**D)** Docs bundle:

```
.claude/references/spacing-system.md
.claude/references/grid-system.md
.claude/references/breakpoints.md
```

## Component-level spacing rules

When defining or refactoring **presentational components** that wrap native elements with design tokens (variant, size, padding, etc.):

- Follow **`.cursor/rules/component-props.mdc`** for prop shape (reference: `src/components/atoms/Button/Button.tsx`).
- Use `ComponentPropsWithoutRef<"element">` to extend native elements.
- Map `size` / `variant` props to token-based class maps — no hardcoded pixel values inside component logic.
- Internal padding (`--space-sm`, `--space-md`) must come from the spacing ramp defined above — never magic numbers.

Para Tailwind CSS v4 y custom properties:

- Follow **`.cursor/rules/styles.md`** for token naming, utility usage, and file organization.
- Tokens (spacing, colors, radii, etc.) are defined via `@theme` in `globals.css` using Tailwind v4 CSS-first config — no `tailwind.config.*` files.
- Component styles use Tailwind utility classes; extract to `@layer components` only when a pattern repeats across 3+ places.
- Arbitrary values (`p-[13px]`) are a last resort — coerce to the nearest spacing token or extend `@theme` instead.
- Do not duplicate token values in component files; always consume via the utility class or `var(--token)` if writing custom CSS alongside Tailwind.

## Rules

- Prefer `gap`/`grid` spacing over brittle margin ladders between siblings — already partly adopted (`section`, `.fields`, `.results`)
- Annotate breakpoints beside literal widths
- Document exceptions (fractional adornment padding tweaks, etc.)
- Prose widths cap around `65ch`
- Prefer `--bottomnav-height` literal instead of scattering `4.5rem`

## Handoff to Agent 07

Deliver:

- Full spacing/bp/z token coverage validated through grep cleanliness
- Exceptions log for intentional non-token numbers
- JSON snapshot aligned with authored CSS comments
