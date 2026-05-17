---
alwaysApply: true
---

## Functions — prefer arrow functions

Use arrow functions for **everything**: components, hooks, helpers, callbacks, and event handlers. Never use `function` declarations or `function` expressions.

```ts
// ✅
export const MyComponent = () => { … }
export const useMyHook = () => { … }
const handleClick = () => { … }

// ❌
export default function MyComponent() { … }
function handleClick() { … }
```

Exceptions: Next.js file-convention **default exports** that Next.js itself requires as `function` (e.g. `generateMetadata`, `generateStaticParams`) — use `export async function` only there.

---

## React imports — named types and hooks

Import from `react` by name (`ReactNode`, `useState`, `useMemo`, etc.). Do **not** use `React.ReactNode`, `React.useState`, etc. Only combine default + named imports when the default is genuinely required.

---

## Import order (top of file)

Order import blocks with a short comment per group. Skip unused groups.

1. `// React` — `react`, `react-dom`
2. `// Next` — `next/*`
3. `// Libraries` — third-party (`@tanstack/*`, `next-intl`, `react-hook-form`, …)
4. `// Hooks` — `@hooks/*` or local `use*` modules
5. `// Components` — `@components/*` or relative UI components
6. `// Icons` — `@icons/*`
7. `// Utils` — `@utils/*`
8. `// Constants` — `@constants/*` or `*.constants`
9. `// Services` — `@services/actions`, `@services/fetchers`
10. `// Types` — `import type …` from `@services/dto`, `*.types`
11. `// Styles` — `*.scss`, `*.module.scss`

After imports, label file-level sections: `// Constants` (literals / mapping objects), `// Types (module-local)`.

---

## File length — split when a module grows

| Length            | Action                                                                      |
| ----------------- | --------------------------------------------------------------------------- |
| ≤ ~200 lines      | No action needed.                                                           |
| > ~200 and ≤ ~250 | Optional: extract subcomponents, local hooks, helpers, constants, or types. |
| > ~250            | **Required to split** before merging.                                       |

---

## Component body order

Inside each component function, add a comment per section:

1. `// Props` — destructured props
2. `// Params` — URL/search params, refs
3. `// Queries` — derived from params or external data
4. `// State` — `useState` and similar
5. `// Hooks` — `useMemo`, `useTranslations`, `useForm`, custom hooks
6. `// Values` — derived values (`watch()`, computed)
7. `// Actions` — callbacks, handlers, `useCallback`
8. `useEffect` — always before `return`

---

## No switch-case — use mapping objects

Replace `switch` with a lookup object + `??` fallback. Valid exceptions: cases with complex multi-line logic, fall-through behavior, or non-mappable logic.

---

## Multiple equality checks — use `includes`

Replace `a === x || a === y || …` with a typed constant array and `.includes(value)`. Define the array next to the related union or above the component.

---

## JSX stored in a variable — use `useMemo`

Wrap React elements assigned to a `const` in `useMemo` with a complete dependency array. Place in the **Hooks** step. Structure the callback with early returns for guards first; the happy path is the final `return`.

---

## State management

- **No `useEffect` for data sync or prop derivation.**
- Prefer: derived values during render, event handlers for user actions, React Query / SWR for API calls, `useMemo` for expensive computations.
- Use `useEffect` only to sync with external systems outside React (WebSockets, third-party DOM APIs, timers). Justify each `useEffect` if introduced.
