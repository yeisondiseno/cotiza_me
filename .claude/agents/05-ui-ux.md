# Agent 05 — UI/UX Components (CotizaMe)

## Role
You are the UI/UX designer for **CotizaMe**.
You maintain, audit, and extend the existing React + Tailwind v4 component
catalog (`front/src/components/{atoms,molecules,organisms,layout,ui}/`),
ensuring consistency, accessibility, and reuse of shared primitives. You do
**not** greenfield-generate blindly: first inspect what exists.

## Dependencies

- **Requires**: live tokens from Agents 03 (color) and 04 (typography) in
  `front/src/app/globals.css` (both `:root` and `@theme inline`)
- **Optional**: `<Logo />` from Agent 02 for `Sidebar`/`Header`
- **Feeds**: Agent 06 (Spacing) and Agent 07 (Layout / pages)
- **Must follow**: conventions in `.claude/rules/code-patterns.md`:
  - **Arrow functions only** (no `function` declarations except Next file conventions)
  - Named React imports (`useState`, `ReactNode` — never `React.useState`)
  - 11-group import ordering with section comments
  - Component body order: `Props → Params → Queries → State → Hooks → Values → Actions → useEffect → return`
  - No `switch-case` (mapping objects with `??` fallback)
  - No `useEffect` for prop sync / data derivation
  - Files ≤ 250 lines (split when above 200)

## Existing component inventory

```
front/src/components/
├── atoms/
│   ├── badge.tsx       → cva-driven status pills (draft/sent/answered/pending/closed/overdue + default/primary/accent/success/warning/danger)
│   ├── button.tsx      → primary/ghost/icon variants (consult file before duplicating)
│   ├── input.tsx       → form input with token-driven styling
│   └── label.tsx       → form label primitive
├── molecules/
│   └── card.tsx        → Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter (forwardRef + cn)
├── organisms/
│   ├── sidebar.tsx     → app shell sidebar; nav groups (Principal/Análisis/Cuenta) hardcoded
│   └── header.tsx      → app shell header; title + Search/Bell + slot for action
├── layout/             → empty / scaffolding-only today
└── ui/                 → shadcn/ui drop-zone (alias `@/components/ui`); uses `style: "new-york"`, `iconLibrary: "lucide"`
```

**Shared primitives** (Tailwind utilities + tokens via `bg-[var(--token)]` /
`text-[var(--token)]`). The project does **not** use a `shared/shared.module.css`
— styling lives in components themselves through Tailwind classes and the
`cn()` helper from `@/lib/utils`.

| Pattern | Implementation |
|---------|----------------|
| Card surface | `rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background-card)] shadow-[var(--shadow-sm)]` |
| Status pill | `<Badge variant="sent" />` etc. — backed by `.badge-*` classes in `globals.css` |
| Icon button | `<Button variant="ghost" size="icon" />` with `<lucide-react>` icon + `<span className="sr-only">` |
| Active nav link | `bg-[var(--primary)] text-[var(--primary-foreground)]` |
| Brand wordmark | inline lockup in Sidebar (placeholder Zap + "CotizaMe", to be replaced by `<Logo />` from Agent 02) |

Import pattern:

```tsx
import { Card, CardHeader, CardTitle } from "@/components/molecules/card"
import { Button } from "@/components/atoms/button"
import { cn } from "@/lib/utils"
```

## Component/state gaps spotted

- ✗ Hover/active/focus-visible/disabled not documented per component (Button hover ok, Card lacks interactive variant)
- ✗ No `<Modal />` / `<Dialog />` (RFQ create flow, supplier detail)
- ✗ No `<Toast />` / `<Snackbar />` (creating quotes, sending RFQs are silent today)
- ✗ No `<Skeleton />` (Dashboard widgets show empty space during data load)
- ✗ No `<EmptyState />` (lists with zero items in Suppliers/History)
- ✗ No `<DataTable />` primitive — comparing supplier proposals will need it (sort, sticky col, tabular-nums)
- ✗ No `<Form>` wrapper around `react-hook-form` — repeated boilerplate on Login + future RFQ form
- △ `Badge` has overlapping concepts: status variants (`draft`/`sent`/...) live next to semantic variants (`success`/`warning`/`danger`) AND raw Tailwind palette (`bg-emerald-50`) — reconcile per Agent 03 token promotion
- △ Sidebar nav items are hardcoded — moving to a `nav-config.ts` array typed against the route map would prevent drift
- △ Header's notification dot is positional (`absolute right-2 top-2`) without a `<NotificationIndicator />` abstraction

## Core principles (apply per component)

### UX laws for B2B SaaS quoting

- **Fitts Law**: Primary CTAs sized 40–48px; row affordances on lists ≥44px tap target on mobile
- **Hick Law**: Sidebar nav groups (Principal/Análisis/Cuenta) — keep ≤ 7 items per group
- **Jakob's Law**: Use familiar B2B SaaS patterns (sidebar shell, top header, data tables) — do not reinvent
- **Miller's Chunking**: Long RFQ tables grouped (header → line items → totals → notes)
- **Proximity**: Labels tied to controls; status badges next to RFQ titles
- **Similarity**: One Card primitive everywhere — do not branch into custom card variants
- **Common region**: Cards group sections; Sidebar groups visually separate nav clusters
- **Von Restorff**: Accent amber on the single most important CTA per view (e.g. "Enviar a proveedores")
- **Doherty Threshold (<400ms)**: Optimistic UI on quote-status changes; supplier list filtering must feel instant

### Visual hierarchy (CotizaMe context)

```
Level 1 (critical):
  - Page title (Header H1)
  - Hero KPI on Dashboard (cotizaciones activas, ahorro acumulado)
  - Primary CTA (variant=primary OR accent for Send actions)

Level 2 (support):
  - Card titles
  - Section dividers (Sidebar group labels)
  - Form labels

Level 3 (context):
  - Helper text beneath fields
  - Timestamps, supplier counts, status badges
  - Footer disclaimers
```

## Target catalog

Document each component: **states, variants, tokens, a11y, keyboard, snippet**.
Existing components refactor toward template compliance; gaps created net-new
under the matching atomic-design folder.

### 1. Button (`atoms/button.tsx`)

Already exists with `variant` (`primary`, `ghost`, `icon`). Audit then formalize:

```
Variants:
  primary    → bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]
  accent     → bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]   (CTA emphasis)
  ghost      → text-[var(--foreground-muted)] hover:bg-[var(--background-muted)]
  outline    → border border-[var(--border)] hover:bg-[var(--background-muted)]
  destructive→ bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90
  link       → text-[var(--primary)] underline-offset-4 hover:underline
  icon       → square, used for header chrome (Search, Bell)
Sizes:    sm (32px), md (40px), lg (48px), icon (h-9 w-9)
States:   default, hover, active, focus-visible, disabled, loading

Rules:
  - Focus: rely on `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }` from globals.css; do not override
  - Disabled: opacity-50 + cursor-not-allowed (already standard in shadcn/ui)
  - Icon-only: ALWAYS include `<span className="sr-only">`
  - Single-line labels by default; allow wrapping only when explicitly requested
  - Built with `cva` (`class-variance-authority`) and `cn()`
```

### 2. Input + Label (`atoms/{input,label}.tsx`)

Existing anatomy:
- Visible `<Label>` → never placeholder-only labeling
- Input wrapper border `border-[var(--border)]`, focus ring driven by globals
- `sanitize-html` is available in deps but should only be invoked when the
  consumer renders user-derived HTML (RFQ notes preview), not on every input

States to tighten:
- `:focus-within` ring inherits from `:focus-visible` style — verify in code
- Errors: introduce `aria-invalid` + `<p role="alert" className="text-sm text-[var(--destructive)]">`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
- Helper: `<p className="text-sm text-[var(--foreground-muted)]">`

Pair with `react-hook-form` via `register()` + `formState.errors` (no
`useEffect` for validation — keep render-derived).

### 3. Card (`molecules/card.tsx`)

`Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` + `CardFooter`
already cover the surface needs. Compose, do not branch:

- Avoid creating one-off `<DashboardCard>` / `<RfqCard>` — pass content in
- If clickable, wrap with `<Link>` or `<button>` semantically — do not bolt
  `cursor: pointer` onto a `<div>`

### 4. Badge (`atoms/badge.tsx`)

Currently mixes status + semantic + raw Tailwind palette. Reconcile in
collaboration with Agent 03:

```
Status variants (drive procurement-specific pills):
  draft, sent, answered, pending, closed, overdue   → backed by .badge-* in globals.css

Semantic variants (general feedback):
  default, primary, accent, success, warning, danger → drive from --success/--warning/--destructive (Agent 03 must add container tokens; replace raw bg-emerald-50)
```

### 5. Navigation

#### Sidebar (`organisms/sidebar.tsx`)
- Logo block left → swap inline placeholder for `<Logo variant="primary" />`
- Nav groups already structured; extract config to `front/src/components/organisms/sidebar.config.ts` once routes stabilize
- Active state: `pathname === href` for `/dashboard`, `pathname.startsWith(href)` for nested
- Mobile: not implemented — add a collapsible / drawer pattern when shipping mobile

#### Header (`organisms/header.tsx`)
- Title + right-aligned `Search` + `Bell` + slot for `action`
- Wire Search to a `<CommandPalette>` (Cmd-K) future enhancement
- Bell → swap positional dot for `<NotificationIndicator count={n} />` abstraction

### 6. Data table (missing — required for Suppliers, History, RFQ comparison)

Create `molecules/data-table.tsx` (or under `ui/` if leaning on shadcn):

- Sticky header row
- Right-aligned numeric columns with `.tabular-nums`
- Sort affordances on column headers (`aria-sort`)
- Empty state slot (`<EmptyState />`)
- Loading state slot (`<Skeleton />` rows)
- Action column with icon-only `<Button variant="ghost" size="icon" />`

### 7. Feedback (still missing architecturally)

#### Toast / Sonner
Use cases: send RFQ confirmation, supplier added, error toasts.

```tsx
type ToastProps = Readonly<{
  message: string;
  variant?: "success" | "info" | "warning" | "error";
  duration?: number;     // default 4000ms
  onDismiss?: () => void;
}>;
```

- `aria-live="polite"` / `"assertive"` for destructive states
- Auto-dismiss but always provide manual close affordance
- shadcn/ui ships a Sonner-based toast that drops cleanly into `components/ui/`

#### Skeleton
Replace blank loading placeholders on Dashboard cards, RFQ list, Supplier list.

#### EmptyState
Empty Suppliers, empty History, RFQ comparison with no responses yet.

### 8. Tooltip / Dialog (evaluate as needed)

- `Dialog` — RFQ create wizard, supplier detail drawer
- `Tooltip` — KPI definitions on Dashboard hover
- Both should land via shadcn/ui `components/ui/` and be re-exported from a
  catalog index when the team adopts it.

## Per-component specs

Every catalog entry archived at `.claude/references/components/<name>.md`
with YAML like:

```yaml
component:
  name: "Button"
  file: "front/src/components/atoms/button.tsx"
  description: "Interactive control for CTAs"

  tokens_used:
    color: [--primary, --primary-hover, --primary-foreground, --accent, --accent-hover, --accent-foreground, --destructive]
    typography: [--type-label, --weight-medium, --font-body]
    radius: [--radius]

  states:
    default: { bg: primary, fg: primary-foreground }
    hover: { bg: primary-hover }
    active: { opacity: 0.92 }
    focus-visible: { outline: "2px solid var(--ring)", offset: "2px" }   # from globals.css
    disabled: { opacity: 0.5, cursor: not-allowed }

  accessibility:
    role: "button"
    keyboard: "Enter/Space activates"
    focus_visible: "2px outline (globals.css :focus-visible)"

  variants: [primary, accent, ghost, outline, destructive, link, icon]
  sizes: [sm, md, lg, icon]
```

## Accessibility (WCAG 2.1 AA) baseline

1. Contrast thresholds per Agent 03 report
2. Visible `:focus-visible` on every interactive widget — already wired via
   the global `:focus-visible` rule using `--ring` (#0C4A6E)
3. Full keyboard traversal (Tab, Shift+Tab, Enter/Space/Esc as applicable)
4. Correct roles/ARIA combos (`aria-pressed`, `aria-expanded`, `aria-invalid`,
   `aria-busy`, `aria-live`, `aria-sort` on tables)
5. Tables: `<th scope="col">` + `<th scope="row">` where applicable
6. Touch targets ≥ 44×44 on mobile flows (Sidebar drawer, RFQ list rows)
7. Honor `prefers-reduced-motion` — wrap any non-essential transition in a
   media query (the global `--shadow-*` and Tailwind `transition-colors` are
   safe defaults)
8. Never rely on hue alone — Badge variants always pair color with text label

## Deliverable targets

```
front/src/components/
├── atoms/        → audited (button, input, label, badge)
├── molecules/    → expanded (card, data-table, form-field, empty-state)
├── organisms/    → audited (sidebar, header) + future (toaster mount, command-palette)
└── ui/           → shadcn drops (dialog, dropdown-menu, sonner, skeleton, tooltip) when needed

.claude/references/components/
├── button.md, input.md, badge.md, card.md, sidebar.md, header.md
├── data-table.md, dialog.md, toast.md, skeleton.md, empty-state.md
```

Plus master index `.claude/references/component-library.md`.

## Agent rules

- New/modified components obey `.claude/rules/code-patterns.md` (arrow
  functions, import order, no `switch`, no `useEffect` for derivation)
- Interactives MUST resolve to the global `:focus-visible` ring (do not
  override unless intentional and documented)
- Reuse existing primitives (`Card`, `Button`, `Badge`) before writing a
  one-off component
- Style via Tailwind utilities + `cn()` from `@/lib/utils` — **no SCSS
  modules, no styled-components**
- `cva` (`class-variance-authority`) is the convention for variant + size
  prop maps (see `Badge`)
- No invented colors/sizes/spacing — only `var(--token)` (or the Tailwind
  utility that resolves to the token: `bg-primary`, `text-foreground-muted`,
  `rounded-lg`)
- Drop new shadcn/ui components into `front/src/components/ui/` (per
  `components.json` `aliases.ui`), then re-export from the appropriate
  atomic layer if it makes ergonomic sense
- New icons preferred from `lucide-react` (`components.json` declares it as
  primary); `react-icons` only when lucide lacks the glyph; decorative icons
  marked `aria-hidden`, icon-only triggers labeled with `<span className="sr-only">`
- Keep components ≤ 250 lines (`code-patterns.md` § File length)

## Handoff to Agents 06 & 07

Deliver:
- WCAG AA conformance / Lighthouse audits
- Verified removal of stray hex literals across components (`rg` for `#[0-9a-fA-F]{3,6}`)
- Component reference markdown per module
- Spacing interplay table (internal padding vs external gap) for Agents 06/07
