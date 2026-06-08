# UI Specification — CotizaMe (MVP)

**Versión:** 1.0  
**Fecha:** 2026-06-03  
**Estado:** Aprobado para diseño e implementación visual  
**Referencias:** `brand-brief.md`, `app-flow.md`, `TRD.md`, `color-tokens.json`, `type-tokens.json`  
**Código fuente de tokens:** `front/src/app/globals.css`

> Puente entre flujos (`app-flow.md`) y sistema visual. Complementa §1.2 de app-flow con **color y tipografía por pantalla**.  
> Agentes 03–07: usar este doc + JSON en `planing/` antes de tocar Figma o componentes.

---

## Índice

1. [Alcance y dependencias](#1-alcance-y-dependencias)
2. [Sistema tipográfico](#2-sistema-tipográfico)
3. [Sistema de color](#3-sistema-de-color)
4. [Equivalencia dominio ↔ Badge](#4-equivalencia-dominio--badge)
5. [Especificación por superficie](#5-especificación-por-superficie)
6. [Emails y marketing](#6-emails-y-marketing)
7. [Accesibilidad y WCAG](#7-accesibilidad-y-wcag)
8. [Roadmap de tokens (post-MVP)](#8-roadmap-de-tokens-post-mvp)
9. [Handoff](#9-handoff)

---

## 1. Alcance y dependencias

### Documentos de planificación

| Documento                                | Rol                                        |
| ---------------------------------------- | ------------------------------------------ |
| `brand-brief.md`                         | Personalidad, voz, dirección color/tipo    |
| `app-flow.md`                            | Pantallas, flujos, componentes, estados UX |
| `TRD.md`                                 | Stack, rutas, API                          |
| `ui-spec.md` (este)                      | Tokens aplicados por vista                 |
| `color-tokens.json` / `type-tokens.json` | Export Figma / tooling                     |

### Superficies MVP

| Grupo      | Rutas                                                        | Layout                       |
| ---------- | ------------------------------------------------------------ | ---------------------------- |
| Landing    | `/`                                                          | Sin shell; marketing         |
| Auth       | `/login`, `/register`, `/forgot-password`, `/reset-password` | Centrado, sin sidebar        |
| Onboarding | `/onboarding/setup`                                          | Card centrada o shell mínimo |
| App        | `/dashboard`, `/rfq/*`, `/suppliers/*`, `/settings/company`  | Sidebar + Header             |
| Respond    | `/respond/[token]`, `/success`, `/error`                     | Público, sin shell app       |

### Convenciones heredadas de `app-flow.md` §1.2

- Un **CTA accent** por vista.
- Estados: `Skeleton`, `EmptyState`, Toast, inline 422.
- i18n: `useTranslations()` — no strings fijos en componentes.
- Números: clase `.tabular-nums` (mono + alineación decimal).

---

## 2. Sistema tipográfico

### Familias

| Rol     | Token CSS        | Tailwind                      | Uso                                   |
| ------- | ---------------- | ----------------------------- | ------------------------------------- |
| Display | `--font-display` | `font-display`                | Títulos, wordmark, KPI labels         |
| Body    | `--font-body`    | `font-sans` / `font-body`     | UI, formularios, tablas               |
| Mono    | `--font-mono`    | `font-mono` + `.tabular-nums` | Precios, cantidades, fechas en tablas |

**Carga:** Google Fonts `@import` en `globals.css` (migración a `next/font` → v2).

### Escala modular (ratio 1.250, base nominal 16px)

| Token             | rem    | px  | Tailwind (objetivo) | Uso principal                          |
| ----------------- | ------ | --- | ------------------- | -------------------------------------- |
| `--type-display`  | 2.4375 | 39  | `text-display`      | KPI hero Dashboard (futuro Reports)    |
| `--type-h1`       | 1.9375 | 31  | `text-h1`           | Título landing hero                    |
| `--type-h2`       | 1.5625 | 25  | `text-h2`           | Secciones landing                      |
| `--type-h3`       | 1.3125 | 21  | `text-h3`           | Título Card / subtítulo sección        |
| `--type-body-lg`  | 1.125  | 18  | `text-body-lg`      | Lead párrafo landing                   |
| `--type-body`     | 1      | 16  | `text-body`         | Copy estándar (objetivo)               |
| `--type-body-sm`  | 0.9375 | 15  | `text-body-sm`      | **Body actual** en `globals.css`       |
| `--type-label`    | 0.875  | 14  | `text-label`        | Nav, botones, inputs, descripción Card |
| `--type-meta`     | 0.8125 | 13  | `text-meta`         | Timestamps, helper secundario          |
| `--type-overline` | 0.75   | 12  | `text-overline`     | Labels sidebar (uppercase + tracking)  |

**Decisión MVP:** Mantener `body { font-size: 0.9375rem }` hasta migración explícita a 16px; nuevas pantallas pueden usar `text-body` (16px) en títulos de contenido y `text-body-sm` en tablas densas.

### Pesos permitidos

| Familia           | Pesos cargados | No usar                      |
| ----------------- | -------------- | ---------------------------- |
| Plus Jakarta Sans | 300–800        | —                            |
| DM Sans           | 300–600        | **700** en body (no cargado) |
| DM Mono           | 400, 500       | —                            |

### Reglas globales

- Headings `h1–h6`: `font-display`, weight 700, `letter-spacing: -0.02em` (ya en globals).
- Sidebar group labels: `text-overline`, uppercase, `--tracking-wider` (mín. 12px, no 10px).
- Prosa larga (notas RFQ, legal): `max-width: 65ch`.
- All-caps solo en overlines; nunca en párrafos.

---

## 3. Sistema de color

### Roles (shadcn-flavored)

| Rol                  | Variable             | Hex     | Uso                             |
| -------------------- | -------------------- | ------- | ------------------------------- |
| Canvas app           | `--background`       | #F8FAFC | Fondo `(app)`                   |
| Superficie           | `--background-card`  | #FFFFFF | Card, modales, tablas           |
| Superficie sutil     | `--background-muted` | #F1F5F9 | Filas zebra, inputs disabled    |
| Texto                | `--foreground`       | #0F172A | Títulos y cuerpo                |
| Texto secundario     | `--foreground-muted` | #64748B | Descripciones, labels           |
| Texto terciario      | `--foreground-faint` | #94A3B8 | Solo meta ≥12px o no-texto      |
| Interacción primaria | `--primary`          | #0C4A6E | Sidebar activo, botón secondary |
| CTA / énfasis        | `--accent`           | #F59E0B | **Un CTA principal por vista**  |
| Éxito sólido         | `--success`          | #10B981 | Iconos éxito (no CTA)           |
| Destructivo          | `--destructive`      | #EF4444 | Eliminar, errores críticos      |
| Info                 | `--info`             | #3B82F6 | Links informativos (V2)         |
| Borde                | `--border`           | #E2E8F0 | Cards, inputs                   |
| Focus                | `--ring`             | #0C4A6E | `:focus-visible` global         |

### CTAs (Agent 05)

| Variant       | Fondo                 | Texto                  | Cuándo                                                          |
| ------------- | --------------------- | ---------------------- | --------------------------------------------------------------- |
| `primary`     | `--primary`           | `--primary-foreground` | Acciones secundarias (Guardar, Siguiente)                       |
| `accent`      | `--accent`            | `--accent-foreground`  | **CTA único de vista** (Enviar cotización, Registrarse en hero) |
| `ghost`       | transparente          | `--foreground-muted`   | Iconos header, filas tabla                                      |
| `destructive` | `--destructive`       | white                  | Confirmar cierre irreversible                                   |
| `outline`     | transparente + border | `--foreground`         | Cancelar en modales                                             |

### Comparador — columna ganadora

| Elemento              | Token recomendado                                                     |
| --------------------- | --------------------------------------------------------------------- |
| Fondo columna         | `--background-muted` o futuro `--accent-soft` (#FBBF24 @ 15% opacity) |
| Borde superior        | `border-strong` + 2px `--accent`                                      |
| Label "Mejor precio"  | `Badge` + `text-label` `--foreground`                                 |
| Celdas precio ganador | `.tabular-nums` + opcional `--success` en ícono check (con texto)     |

---

## 4. Equivalencia dominio ↔ Badge

Estado en API / `app-flow.md` → variante `<Badge />` / clase CSS.

| Dominio (`app-flow`, API) | Badge variant       | Clase CSS actual           | Label i18n (es) |
| ------------------------- | ------------------- | -------------------------- | --------------- |
| `draft`                   | `draft`             | `.badge-draft`             | Borrador        |
| `sent` (RFQ)              | `sent`              | `.badge-sent`              | Enviada         |
| `closed`                  | `closed`            | `.badge-closed`            | Cerrada         |
| `expired`                 | `overdue`           | `.badge-overdue`           | Vencida         |
| `pending` (proveedor)     | `pending`           | `.badge-pending`           | Pendiente       |
| `sent` (proveedor)        | `sent`              | `.badge-sent`              | Enviada         |
| `responded`               | `answered`          | `.badge-answered`          | Respondió       |
| `failed`                  | `danger` o `failed` | _(añadir `.badge-failed`)_ | Fallido         |

> **Importante:** El dominio usa `responded`; el CSS usa `answered`. En código: `status === 'responded' ? 'answered' : status`.

---

## 5. Especificación por superficie

Leyenda columnas: **Tipo** = tokens tipográficos | **Color** = fondo / texto / CTA | **Notas**

### 5.1 Landing `(landing)/`

| Elemento        | Tipo                                    | Color                            | Notas                       |
| --------------- | --------------------------------------- | -------------------------------- | --------------------------- |
| Hero H1         | `text-h1` fluid + `font-display` + bold | `--foreground` on `--background` | Tagline de `brand-brief.md` |
| Subhero         | `text-body-lg` + `font-body`            | `--foreground-muted`             | max 65ch                    |
| CTA hero        | `text-label` semibold                   | `accent` / `accent-foreground`   | Único accent                |
| CTA secundario  | `text-label`                            | `outline` + `--primary` text     | "Ver demo" (opcional)       |
| Nav / footer    | `text-label`                            | `--foreground-muted`             | Links hover `--primary`     |
| Fondo           | —                                       | `--background`                   | Sin sidebar                 |
| Sección alterna | —                                       | `--background-muted`             | Pricing teaser V2           |

**Estados:** N/A (estático MVP).

---

### 5.2 Auth `(auth)/`

| Pantalla       | Título                       | Tipo título                | Card                               | CTA                      |
| -------------- | ---------------------------- | -------------------------- | ---------------------------------- | ------------------------ |
| Login          | Iniciar sesión               | `text-h3` display semibold | `--background-card`, `--shadow-md` | accent: Ingresar         |
| Register       | Crear cuenta                 | igual                      | igual                              | accent: Registrarse      |
| Forgot / Reset | Recuperar / Nueva contraseña | igual                      | igual                              | accent: Enviar / Cambiar |

| Elemento        | Tipo                            | Color                             |
| --------------- | ------------------------------- | --------------------------------- |
| Labels campos   | `text-label` medium             | `--foreground`                    |
| Inputs          | `text-body-sm`                  | border `--border`, focus `--ring` |
| Errores 422     | `text-meta`                     | `--destructive`, `role="alert"`   |
| Link secundario | `text-label`                    | `--primary` underline             |
| Fondo página    | —                               | `--background`                    |
| Logo lockup     | `text-body` bold `font-display` | `--primary` icono + wordmark      |

---

### 5.3 Onboarding `/onboarding/setup`

| Elemento      | Tipo                  | Color                |
| ------------- | --------------------- | -------------------- |
| Título        | `text-h3` display     | `--foreground`       |
| Descripción   | `text-label`          | `--foreground-muted` |
| CTA Continuar | `text-label` semibold | **accent**           |
| Card          | —                     | `--background-card`  |

---

### 5.4 App shell (Sidebar + Header)

| Elemento             | Tipo                                     | Color                                                  |
| -------------------- | ---------------------------------------- | ------------------------------------------------------ |
| Sidebar fondo        | —                                        | `--background-card` o blanco + border-right `--border` |
| Wordmark             | `text-body` bold `font-display`          | `--foreground`                                         |
| Nav item default     | `text-label` medium                      | `--foreground-muted`                                   |
| Nav item active      | `text-label` medium                      | bg `--primary`, fg `--primary-foreground`              |
| Group label          | `text-overline` uppercase tracking-wider | `--foreground-faint`                                   |
| Header título página | `text-body` semibold `font-display`      | `--foreground`                                         |
| Header CTA slot      | `text-label`                             | **accent** button                                      |
| Iconos Search/Bell   | icon 20px                                | `--foreground-muted` (Bell oculto MVP)                 |

**Layout tokens:** `--sidebar-width: 240px`, `--header-height: 56px`.

---

### 5.5 Dashboard `/dashboard`

| Elemento                   | Tipo                          | Color                                       |
| -------------------------- | ----------------------------- | ------------------------------------------- |
| KPI valor                  | `text-display` tabular-nums   | `--foreground`                              |
| KPI label                  | `text-label`                  | `--foreground-muted`                        |
| Card                       | `text-h3` título              | `--background-card`, `--shadow-sm`          |
| Fila reciente título       | `text-label` medium           | `--foreground`                              |
| Fila meta (2/3 respuestas) | `text-meta` tabular-nums      | `--foreground-muted`                        |
| Badge estado RFQ           | `text-overline` / `text-meta` | ver §4                                      |
| Empty recientes            | `text-body`                   | `--foreground-muted` + ilustración opcional |
| Skeleton                   | —                             | `--background-muted` animate pulse          |

**API:** Ocultar bloque ahorro si `monthly_savings === null`.

---

### 5.6 Proveedores `/suppliers`, `/suppliers/[id]`

| Elemento           | Tipo                      | Color                                          |
| ------------------ | ------------------------- | ---------------------------------------------- |
| Tabla header       | `text-overline` uppercase | `--foreground-muted` on `--background-muted`   |
| Celda nombre       | `text-label`              | `--foreground`                                 |
| Celda email        | `text-meta`               | `--foreground-muted`                           |
| Precio / números   | `text-label` tabular-nums | `--foreground`                                 |
| CTA Agregar        | accent                    | header slot                                    |
| Modal crear        | `text-h3` título          | `--background-card`                            |
| Banner límite plan | `text-meta`               | `--warning` container (futuro) o muted + icono |
| Empty              | `text-body`               | CTA accent "Agregar primer proveedor"          |

---

### 5.7 RFQ — Lista `/rfq`

Igual densidad que proveedores; columna estado con Badge §4; CTA header "Nueva cotización" → accent.

---

### 5.8 RFQ — Wizard `/rfq/new`, `/rfq/[id]/edit`

| Paso        | Título wizard | Progreso                  | CTA principal                | Secundario       |
| ----------- | ------------- | ------------------------- | ---------------------------- | ---------------- |
| 1 items     | `text-h3`     | `text-meta` "Paso X de 4" | accent Siguiente (tras POST) | —                |
| 2 suppliers | igual         | igual                     | accent Siguiente             | primary Anterior |
| 3 config    | igual         | igual                     | accent Siguiente             | primary Anterior |
| 4 review    | igual         | igual                     | **accent** Enviar cotización | primary Anterior |

| Elemento                | Tipo                          | Color                                               |
| ----------------------- | ----------------------------- | --------------------------------------------------- |
| Tabla ítems desktop     | `text-label` / `text-body-sm` | filas `--border`                                    |
| Tabla ítems mobile      | cards `text-label`            | `--background-card`                                 |
| Radio WhatsApp disabled | `text-label`                  | `--foreground-faint` + Badge "Professional+"        |
| Resumen paso 4          | `text-label`                  | `--foreground-muted` labels, valores `--foreground` |

---

### 5.9 RFQ — Detalle `/rfq/[id]`

| Elemento           | Tipo                                                      | Color                               |
| ------------------ | --------------------------------------------------------- | ----------------------------------- |
| Título + Badge RFQ | `text-h3` + badge                                         | §4                                  |
| Meta deadline      | `text-meta`                                               | `--foreground-muted`                |
| Fila proveedor     | `text-label` + badge                                      | §4                                  |
| Acciones fila      | `text-label` buttons ghost/outline                        | primary solo "Ver respuesta"        |
| Footer CTAs        | Ver comparador: primary; Cerrar: outline/destructive (V2) | comparador disabled si 0 respuestas |

---

### 5.10 Comparador `/rfq/[id]/compare`

| Elemento                | Tipo                               | Color                                                                     |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------- |
| Header tabla sticky     | `text-overline`                    | bg `--background-card`, border `--border`                                 |
| Celda ítem              | `text-label`                       | `--foreground`                                                            |
| Precio unitario / total | `text-label` **tabular-nums**      | `--foreground`; ganador opcional `--success` icon + texto                 |
| Fila TOTAL              | `text-label` semibold tabular-nums | —                                                                         |
| Banner ahorro           | `text-body-sm`                     | `--foreground-muted`; cifra tabular-nums                                  |
| CTA seleccionar ganador | `text-label`                       | outline o primary por columna; confirm modal destructive + accent confirm |

---

### 5.11 Respond público `/respond/*`

| Pantalla              | Tipo                      | Color                          |
| --------------------- | ------------------------- | ------------------------------ |
| Logo + marca CotizaMe | `text-label` bold display | `--primary`                    |
| Título solicitud      | `text-h3` display         | `--foreground`                 |
| Saludo proveedor      | `text-body`               | `--foreground`                 |
| Tabla precios         | `text-label` tabular-nums | inputs `--background-card`     |
| CTA Enviar            | accent                    | full width mobile              |
| Success               | `text-h3` + `text-body`   | icon `--success` + label texto |
| Error page            | `text-h3`                 | `--foreground`; sin sidebar    |

Fondo: `--background`; card formulario `--background-card` max-w-2xl centrado.

---

### 5.12 Settings `/settings/company`

Formulario estándar auth; CTA Guardar = `primary` (no accent — no es la acción única de conversión de la vista si hay un solo botón, puede ser accent).

---

## 6. Emails y marketing

| Template                | Header                        | Body                   | CTA button                            |
| ----------------------- | ----------------------------- | ---------------------- | ------------------------------------- |
| Bienvenida              | bg `#0C4A6E`, texto `#F0F9FF` | `#0F172A` on `#FFFFFF` | accent `#F59E0B`                      |
| RFQ a proveedor         | logo + nombre comprador       | tabla ítems simple     | accent "Cotizar ahora" → link respond |
| Reset password          | igual auth tone               | corto                  | primary navy button                   |
| Respuesta recibida (V2) | —                             | —                      | link a `/rfq/:id`                     |

**Tipografía email:** system-ui fallback; opcional Plus Jakarta solo en H1 (web font link).

---

## 7. Accesibilidad y WCAG

### Pares mínimos (verificar tras cambios — informe completo en Agent 03)

| Par                                         | Ratio mín.              | Estado esperado |
| ------------------------------------------- | ----------------------- | --------------- |
| `--foreground` on `--background`            | 7:1                     | AAA             |
| `--foreground-muted` on `--background-card` | 4.5:1                   | AA              |
| `--foreground-faint` on `--background-card` | ≥3:1 solo UI no crítica | No body text    |
| `--primary-foreground` on `--primary`       | 4.5:1                   | AA              |
| `--accent-foreground` on `--accent`         | 4.5:1                   | AA              |
| Cada `--status-*-fg` on `--status-*-bg`     | 4.5:1                   | AA              |
| `--ring` focus on `--background-card`       | 3:1                     | UI SC 1.4.11    |

### Reglas de producto

- Badge siempre con texto (§4).
- No depender de verde/rojo solo en comparador.
- Toasts: `aria-live="polite"`; errores bloqueantes `assertive`.
- Touch 44px en respond y listas móvil (`app-flow` §1.1).

---

## 8. Roadmap de tokens (post-MVP)

| Item                                         | Prioridad | Owner       |
| -------------------------------------------- | --------- | ----------- |
| Promover `--status-*` en `:root` + `@theme`  | P1        | Agent 03    |
| `.badge-failed` + variant Badge              | P1        | Agent 03/05 |
| `--type-*` en `@theme` → `text-h1`, etc.     | P1        | Agent 04    |
| Semantic containers (`success-container`, …) | P2        | Agent 03    |
| `--accent-soft` columna comparador           | P2        | Agent 03    |
| Dark mode spec                               | V2        | Agent 03    |
| `color-wcag-report.md` automatizado          | P1        | Agent 03    |
| Migrar body 15px → 16px                      | P2        | Agent 04    |

---

## 9. Handoff

| Siguiente           | Input                                                           |
| ------------------- | --------------------------------------------------------------- |
| Agent 02 Logo       | `brand-brief.md` §logo                                          |
| Agent 03 Color      | `color-tokens.json` + §3–4 + implementar gaps §8                |
| Agent 04 Type       | `type-tokens.json` + §2 + exponer en `@theme`                   |
| Agent 05 Components | §5 + `app-flow.md` matriz componentes                           |
| Agent 06 Spacing    | Grid 8px, padding Card, page gutters (definir en siguiente doc) |
| Agent 07 Pages      | Este doc + `app-flow.md` por ruta                               |

**Figma (opcional):** Importar `color-tokens.json` y `type-tokens.json`; una frame por fila de §5.

---

_Documento creado el 2026-06-03_
