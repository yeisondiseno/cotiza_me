# Planificación — CotizaMe

Índice de documentos del producto y diseño. Orden de lectura recomendado para implementación MVP.

## Empezar a construir

| Documento                                            | Contenido                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| [implementation-plan.md](./implementation-plan.md)   | **Plan de construcción paso a paso** (Fase 0 + Slices A–D)    |

## Negocio y producto

| Documento                      | Contenido                                  |
| ------------------------------ | ------------------------------------------ |
| [init.md](./init.md)           | Plan de negocio, pricing, expansión        |
| [PRD.md](./PRD.md)             | Requisitos funcionales, planes, slices MVP |
| [user-flow.md](./user-flow.md) | Flujos de usuario (alto nivel)             |

## Técnico

| Documento                          | Contenido                                                  |
| ---------------------------------- | ---------------------------------------------------------- |
| [TRD.md](./TRD.md)                 | Stack, API, DB, arquitectura frontend/backend              |
| [back-schema.md](./back-schema.md) | Modelo de datos: tablas, columnas, relaciones, ER, índices |
| [app-flow.md](./app-flow.md)       | Pantallas, rutas, API por flujo, convenciones UI           |

## Marca y diseño

| Documento                                | Contenido                                            |
| ---------------------------------------- | ---------------------------------------------------- |
| [brand-brief.md](./brand-brief.md)       | Personalidad, posicionamiento, voz, dirección visual |
| [ui-spec.md](./ui-spec.md)               | Color y tipografía por pantalla, badges, WCAG        |
| [color-tokens.json](./color-tokens.json) | Tokens de color (Figma / tooling)                    |
| [type-tokens.json](./type-tokens.json)   | Tokens tipográficos                                  |

## Agentes Claude (`.claude/agents/`)

| Agente         | Consume principalmente                              |
| -------------- | --------------------------------------------------- |
| 01 Brand       | `brand-brief.md`                                    |
| 02 Logo        | `brand-brief.md`                                    |
| 03 Color       | `brand-brief.md`, `color-tokens.json`, `ui-spec.md` |
| 04 Typography  | `brand-brief.md`, `type-tokens.json`, `ui-spec.md`  |
| 05 UI/UX       | `ui-spec.md`, `app-flow.md`, `globals.css`          |
| 06 Spacing     | `ui-spec.md`, `app-flow.md`                         |
| 07 Maquetación | `app-flow.md`, `ui-spec.md`, `TRD.md`               |

## Referencias para IDE (`.claude/references/`)

Copias o punteros a los artefactos en `planing/` — ver [`.claude/references/README.md`](../.claude/references/README.md).

---

## Fuente única de verdad (anti-duplicidad)

Cada tema tiene **un solo dueño**. El resto de documentos deben *enlazar*, no
copiar, para evitar deriva. Detalle en [`implementation-plan.md`](./implementation-plan.md) §0.

| Tema                                   | Dueño canónico                          |
| -------------------------------------- | --------------------------------------- |
| Negocio, pricing, roadmap de mercado   | `init.md`                               |
| Requisitos funcionales + columna MVP   | `PRD.md` §6                             |
| Planes y límites (valores)             | `PRD.md` §5 · `TRD.md` §11.1            |
| Pantallas / rutas frontend             | `PRD.md` §9                             |
| Endpoints API (`/api/v1`)              | `PRD.md` §10 · `TRD.md` §5              |
| Esquema de datos (tablas, FK, índices) | `back-schema.md`                        |
| Stack y versiones                      | `TRD.md` §1                             |
| Marca, voz, léxico                     | `brand-brief.md`                        |
| Color/tipografía + tokens              | `ui-spec.md` · `*-tokens.json`          |
| Orden de construcción / tareas         | `implementation-plan.md`                |

**Prefijo API canónico:** `/api/v1/...` (cualquier `/api/...` sin versión es histórico).

---

**Versión del paquete de planificación:** 2026-07-22 (TRD/app-flow v1.1 + brand/ui-spec v1.0 + back-schema v1.0 + implementation-plan v1.0)
