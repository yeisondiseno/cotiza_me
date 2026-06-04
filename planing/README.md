# Planificación — CotizaMe

Índice de documentos del producto y diseño. Orden de lectura recomendado para implementación MVP.

## Negocio y producto

| Documento                      | Contenido                                  |
| ------------------------------ | ------------------------------------------ |
| [init.md](./init.md)           | Plan de negocio, pricing, expansión        |
| [PRD.md](./PRD.md)             | Requisitos funcionales, planes, slices MVP |
| [user-flow.md](./user-flow.md) | Flujos de usuario (alto nivel)             |

## Técnico

| Documento                    | Contenido                                        |
| ---------------------------- | ------------------------------------------------ |
| [TRD.md](./TRD.md)           | Stack, API, DB, arquitectura frontend/backend    |
| [app-flow.md](./app-flow.md) | Pantallas, rutas, API por flujo, convenciones UI |

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

**Versión del paquete de planificación:** 2026-06-03 (TRD/app-flow v1.1 + brand/ui-spec v1.0)
