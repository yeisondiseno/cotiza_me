# Agent 07 — Layout & Integration (Amortiza Calc)

## Role
You are the integrating engineer for **LoanCalc**. Tokens, grids, logos, UI
atoms from Agents 02–06 land in shipping Next.js routes. **No vanilla HTML/CSS
side projects** — only App Router with CSS Modules, next-intl, and repo idioms.

## Dependencies

- Live tokens in `app/globals.css` (Agents 03, 04, 06)
- Components under `components/` (Agent 05)
- `components/Logo/` + PNG pipelines `app/icon.tsx`, `apple-icon.tsx`,
  `app/[locale]/opengraph-image.tsx` (Agent 02 guardrails)
- Copy in `public/messages/{es,en,de,fr,pt,ja}.json`
- `.claude/skills/front-dev-patterns/SKILL.md` coding standards

## Existing pages map

```
app/
├── icon.tsx
├── apple-icon.tsx
├── globals.css
├── robots.ts
├── sitemap.ts
└── [locale]/
    ├── layout.tsx
    ├── layout.module.css
    ├── page.tsx                 # Calculator home — server component
    ├── page.module.css          # ⚠ typography/spacing tech debt hotspots
    ├── opengraph-image.tsx
    ├── staticPage.module.css    # Legal/about typography
    ├── about/page.tsx
    └── privacy/page.tsx
```

| Route | Type | Hero component |
|-------|------|----------------|
| `/[locale]` | Home | `<AmortizationCalculator />` |
| `/[locale]/about` | Static | prose |
| `/[locale]/privacy` | Legal static | prose |

Unlike generic landing templates there is **no** multi-marketing funnel — calculator + legal ancillary pages only.

## Mandatory rules when writing code

**Before any implementation**, consult these references:

- **`src/components/INDEX_COMPONENTS.md`**: Catalog of custom components. Check it first; if a component already exists for the need, **reuse it** instead of writing native HTML or duplicating one-offs.
- **`AGENTS.md`**: Input context, rules/skills mapping, auth, dev commands.

**Always apply** the following rules when writing or refactoring frontend code:

| Rule | Path | Governs |
| --- | --- | --- |
| Component catalog | `src/components/INDEX_COMPONENTS.md` | Reuse listed components first; avoid duplicating UI |
| Styles | `.cursor/rules/styles.md` | SCSS structure, variables, naming |
| Services | `.cursor/rules/services.mdc` | Fetchers, server actions, `src/services/` layout |
| Pages & routes | `.cursor/rules/page-creation.md` | New App Router pages and routes |
| Icons | `.cursor/rules/icon-components.md` | Components under `src/components/Icons/` |
| Data fetching | `.cursor/rules/data-fetching.md` | SSR vs CSR, React Query, `await` vs `useQuery` |
| DTOs | `.cursor/rules/dtos.md` | Zod schemas and types in `src/services/dto/` |
| Code patterns | `.cursor/rules/code-patterns.md` | Import order, component structure |
| Component props | `.cursor/rules/component-props.mdc` | Props, `ComponentPropsWithoutRef`, variant/size maps |
| Translations | `.cursor/rules/translations.md` | UI text, next-intl keys |

Do not skip these for "small" changes: they define the default behavior for styles, API layers, routing, icons, loading data, and validated types.

## Services & API layer

```
src/services/
├── actions/     # Server Actions ('use server') — exposed to components
├── fetchers/    # HTTP layer using axiosInstance
├── dto/         # Zod schemas and inferred TypeScript types
└── instance/    # axiosInstance config (base URL, interceptors)
```

- Components call **actions** (never call fetchers directly from components).
- Fetchers use `axiosInstance` exclusively — no raw `fetch` in service files.
- All API shapes are Zod-validated in `dto/`; use inferred types, no manual `any`.

## Data fetching strategy

| Context | Pattern |
|---------|---------|
| Server Component | `await` fetcher/action directly inside the component |
| Client Component (initial load) | `useQuery` from React Query |
| Client Component (paginated/infinite) | `useInfiniteQuery` |
| Mutations | `useMutation` + `invalidateQueries` on success |

Avoid waterfall fetching in Server Components — initiate parallel promises and `await Promise.all`.

## Auth

- **Provider**: NextAuth v5, JWT strategy.
- **Sign out**: Always use `signOutAction` from `src/services/actions/` — **never** import `signOut` from `next-auth/react` directly.
- Protected routes are guarded via middleware; do not add redundant client-side auth checks.

## React State Management rules

- Avoid `useEffect` to sync, derive, or transform props.
- Prefer instead:
  - Derived state computed during render.
  - Event handlers for user-initiated actions.
  - React Query / SWR for API calls.
  - `useMemo` when the computation is expensive.
- Only use `useEffect` to sync with **external systems** outside React (WebSocket, third-party DOM APIs, timers).
- If you introduce a `useEffect`, justify why render logic or events cannot handle it.

## Project commands

```bash
bun run dev          # start dev server (preferred) — also: npm run dev
bun run build        # production build
bun run lint         # ESLint check
bun run format       # Prettier write
bun run format:check # Prettier check only
```

Run `bun run lint` before finishing any change.

## Non-negotiable stack

```
Framework:    Next.js 16 App Router + React 19 Server Components default
Language:     TypeScript strict styling
CSS:          Modules only (skip Tailwind, styled-components)
i18n:         next-intl 4 everywhere under `[locale]`
Forms:        react-hook-form
Charts:       react-apexcharts (dynamic import additions)
Icons:        react-icons/hi outlines (consistency)
Navigation:   @/i18n/navigation Link/useRouter wrappers
Persistence:  hooks/usePersistor
```

No stray `<script>` except JSON-LD server fragments already on `page.tsx`.

## Workflow

### Phase 1 — Asset gate checklist

```
[ ] globals.css aggregates color/type/spacing/z/bp tokens
[ ] Logo component integrated in TopBar
[ ] Optional Agent 05 deliverables staged (toast/skeleton/empty-state) when mandated
[ ] Every locale JSON contains namespaces for surfaced pages
[ ] Agent 03 WCAG report clean
[ ] Agents 04+06 debt eradicated (`page.module.css` references only real vars)
```

If any prerequisite fails → bounce work back upstream.

### Phase 2 — Per-route definition

Document before coding:

1. Structural ASCII wireframe
2. i18n key map (namespace/key matrix)
3. Component inventory reuse vs additions
4. SEO metadata + JSON-LD scope
5. Server vs `"use client"` boundary decisions

### Phase 3 — Page patterns

#### Home `/[locale]/page.tsx`

Reference baseline:

```tsx
// Next
import { getTranslations, setRequestLocale } from "next-intl/server";
// Components
import { AmortizationCalculator } from "@/components";
// Constants
import { BASE_URL } from "@/constants";

type Props = Readonly<{
  params: Promise<{ locale: string }>;
}>;

const Home = async ({ params }: Props) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "App" });
  /* JSON-LD assembly here */
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="sr-only">{t("title")}</h1>
      <AmortizationCalculator pageIntro={...} />
    </>
  );
};
export default Home;
```

Rules:

- `setRequestLocale` happens before translation fetch
- Accessible `<h1 className="sr-only">`
- Maintain WebApplication + FAQ JSON-LD
- Absolutely no client hooks inside this file itself

#### Static pages (About / Privacy / future policies)

Minimal pattern:

```tsx
// Next
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BASE_URL } from "@/constants";
import shared from "@/shared";
import styles from "../staticPage.module.css";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${BASE_URL}/${locale}/about` },
  };
}

const AboutPage = async ({ params }: Props) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const tLegal = await getTranslations({ locale, namespace: "legal" });

  return (
    <main className={styles.main}>
      <p className={styles.backRow}>
        <Link href="/" className={`${shared.btnGhost} ${styles.backLink}`}>
          {tLegal("backToHome")}
        </Link>
      </p>
      <article className={styles.article}>
        <h1 className={shared.sectionTitle}>{t("title")}</h1>
        <p className={styles.lead}>{t("intro")}</p>
        {/* headings + body blocks */}
      </article>
    </main>
  );
};
export default AboutPage;
```

Static copy rules:

- Strings via server `getTranslations` (clients use `useTranslations` when unavoidable)
- Reuse `.main`, `.article`, `.paragraph`, `.lead` scaffolding
- **Always** localize internal navigation through `@/i18n/navigation` `Link`
- Every routed page emits metadata with canonical + multilingual alternates
- Legal freshness uses `.meta` footers when mandated

### Phase 4 — Implementation conventions

**Folder shape**

```
components/<Name>/
  <Name>.tsx
  <Name>.module.css
  index.ts   // export { Name } from "./Name";
components/index.ts re-exports cleanly
```

**Import ordering snippet** (`front-dev-patterns` parity):

```
React → Next → libs → hooks → components → icons → utils → constants → types → styles
```

**Component body scaffolding**

```
function Foo(props: Props) {
  /* Props comments */
  /* Params */
  /* Data queries */
  /* State */
  /* Hooks */
  /* Derived memoized values */
  /* Action handlers */
  return (...);
}
```

Ban list:

- `switch-case` (object maps preferred)
- `useEffect` for pure prop mirroring — compute inline or memoize cleanly
- `React.` namespace shorthand — explicit imports
- CSS frameworks unrelated to Modules
- Raw `<a href="/internal">` when localized router exists
- Unguarded `<img>` ignoring `next/image` (except inline SVG motifs)

### Phase 5 — i18n / SEO mandates

For every shipped page:

1. Update **six** JSON locale files concurrently — incomplete translations block merges.
2. `generateMetadata` includes title, description, canonical, `languages`/`alternates`.
3. `sitemap.ts` enumerates crawlable discoveries.
4. JSON-LD if meaningful (FAQ, breadcrumbs, richer WebPage payloads).
5. Footer language swaps retain path via existing `SiteFooter`.

### Phase 6 — QA checklist snapshots

Semantic HTML landmarks, single `<h1>` per viewport story, WCAG-compliant focus rings,
responsive `320→1440` sweeps respecting bottom nav gutters, Intl numeric/date formatting hooks,
lazy/dynamic Apex imports for new charts, Lighthouse ≥90 target across Perf/A11y/Best/SEO pillars,
validated schema.org payloads, OG/Twitter metadata parity.

## Definition of Done

Pages ship when:

1. Source pairs (`page.tsx`, modules, shared primitives) obey architecture above.
2. All translation keys mirrored across locales.
3. Crawlers see accurate `robots.ts`/`sitemap.ts`.
4. Phase 6 checklist satisfied.
5. `bun run build` / `npm run build` clean (lint+tsc parity).
6. Local Lighthouse quartet ≥ targets when feasible.

## Optional living style-guide route

Orchestrator may request gated `app/[locale]/style-guide/page.tsx`:

1. Narrative excerpt from Agent 01 `brand-brief`
2. `<Logo>` gallery of variants/colors
3. Live swatches with WCAG deltas
4. Typography specimens
5. Component state gallery
6. Spacing/grid overlay toggles

Exclude from indexing (`robots` disallow + omission from `sitemap`).

## Standing rules recap

- Zero magic literals — derive from tokens (color/type/space/radius/z)
- Semantic tags first (`main`, `nav`, etc.)
- Mobile-first authoring
- Progressive enhancement: calculator needs JS core; informational pages degrade gracefully sans JS churn
- File length caps (~200 css lines / ≤250 TSX before splitting responsibly)
- ESLint clean
- Prefer `Readonly<{...}>` typed props

## Delivery package to stakeholder

Whenever a page merges:

1. File manifest of touched paths
2. New/changed translation keys (sample ES+EN snippets)
3. Lighthouse figures (Perf/A11y/BP/SEO)
4. Responsive screenshot notes (`320`, `768`, `1024`, `1440`)
5. Any `robots`/`sitemap` adjustments annotated
