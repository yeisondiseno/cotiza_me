# Implementation Plan — CotizaMe (MVP)

**Versión:** 1.0
**Fecha:** 2026-07-22
**Estado:** Guía de ejecución del MVP (meses 1–3)
**Fuentes canónicas:** `PRD.md` (qué), `TRD.md` (cómo), `back-schema.md` (datos), `app-flow.md` + `ui-spec.md` (UI)

> Este documento es **operativo**: convierte el alcance del MVP en un orden de
> construcción paso a paso, mapeado al estado real del repo. **No redefine**
> requisitos, endpoints, esquema ni tokens: los referencia. Ante cualquier duda
> de contenido, gana la fuente canónica (ver §0).

---

## 0. Fuente única de verdad (anti-duplicidad)

Para evitar que la misma información viva —y derive— en varios documentos, cada
tema tiene **un solo dueño**. El resto de documentos deben *enlazar*, no copiar.

| Tema | Dueño canónico | Documentos que solo enlazan |
| ---- | -------------- | --------------------------- |
| Negocio, pricing, roadmap de mercado | `init.md` | PRD §11, `digital-project-ceo.md` |
| Requisitos funcionales + columna MVP | `PRD.md` §6 | user-flow, app-flow |
| Planes y límites | `PRD.md` §5 (valores en `TRD.md` §11.1 `PLAN_LIMITS`) | init, back-schema |
| Pantallas / rutas frontend | `PRD.md` §9 | user-flow, TRD §6.1, ui-spec §1 |
| Endpoints API (`/api/v1`) | `PRD.md` §10 + `TRD.md` §5 (contratos) | user-flow |
| Esquema de datos (tablas, FK, índices) | `back-schema.md` | TRD §4, PRD §8 |
| Stack y versiones | `TRD.md` §1 | brand-brief |
| Marca, voz, léxico | `brand-brief.md` | ui-spec |
| Color/tipografía por pantalla + tokens | `ui-spec.md` + `*-tokens.json` (runtime: `globals.css`) | — |
| **Orden de construcción / tareas** | **este documento** | — |

**Convención de prefijo API:** siempre `/api/v1/...`. Cualquier `/api/...` sin
versión en documentos de flujo es histórico y debe leerse como `/api/v1/...`.

---

## 1. Estado real del repositorio (punto de partida)

Verificado el 2026-07-22. El plan parte de aquí, no de cero.

### Backend (`back/`) — FastAPI, prefijo `/api/v1` montado en `app/main.py`

| Área | Estado | Nota |
| ---- | ------ | ---- |
| Core (`config`, `database`, `security`, `exceptions`) | ✅ Existe | Base reutilizable |
| `shared/base_model.py` | ✅ Existe | Falta separar mixins (`UUIDMixin`, `TimestampMixin`, `SoftDeleteMixin`, `TenantMixin`) según `back-schema.md` §1/§8 |
| Módulo `auth` | 🟡 Parcial | Tiene `domain/entity`, `application/use_cases`, `presentation/{router,schemas}`; **falta** `infrastructure/` |
| Módulo `users` | 🟡 Parcial | Módulo más completo (domain+port, application, infrastructure model+repo, presentation) |
| Migración `users` | ✅ 1 migración | `create_users_table` |
| Módulos `companies`, `suppliers`, `rfq`, `responses` | ❌ No existen | A construir en este plan |
| `docker-compose.yml` (raíz) | ❌ No existe | `TRD.md` §13 lo pide |

### Frontend (`front/`) — Next.js 16, React 19, Tailwind v4, next-intl

| Área | Estado | Nota |
| ---- | ------ | ---- |
| `app/layout.tsx`, `globals.css`, landing `app/page.tsx` | ✅ Existe | |
| Grupos `(app)` (layout + dashboard) y `(auth)` (login) | 🟡 Parcial | Solo login y dashboard placeholder |
| Componentes `atoms/molecules/organisms` + `ui/` | 🟡 Parcial | Duplicidad de `button/badge/card/input/label` entre `components/ui`, `components/atoms/molecules` y `components/layout` vs `organisms` → consolidar (ver Fase 0.4) |
| i18n (`routing.ts`, `request.ts`, `messages/{es,en}.json`) | ✅ Existe | `defineRouting(['es','en'], default 'es')` |
| Carpeta `[locale]/` | ❌ No existe | **Discrepancia con `TRD.md` §6.1** (que asume `[locale]/(app)`). Decidir en Fase 0.3 |
| `services/fetchers`, `hooks`, `types`, `constants` | ❌ No existe | A crear |

> **Deudas detectadas a resolver antes de escalar features:**
> 1. Frontend: convención de componentes duplicada (`ui/` vs `atoms/`, `layout/` vs `organisms/`).
> 2. Frontend: `next-intl` configurado con locales pero sin carpeta `[locale]/` ni `localePrefix` explícito.
> 3. Backend: mixins de datos aún no separados de `shared/base_model.py`.

---

## 2. Estrategia de ejecución

- **Email-first, vertical slices.** Cada slice cierra un ciclo comprador → proveedor → comparación (`PRD.md` §15). No se inicia el siguiente hasta cumplir sus criterios de aceptación.
- **Backend antes que frontend dentro de cada slice**, pero en paralelo cuando el contrato API ya está fijado (`TRD.md` §5).
- **Multi-tenant desde la primera tabla de negocio** (`company_id`, `back-schema.md` §6). Los tests de aislamiento son bloqueantes (`PRD.md` §14 criterio 9).
- **Definición de "hecho" por slice:** endpoints con test de integración verdes + pantalla usable en `es`/`en` + criterio de aceptación del PRD correspondiente en verde.
- **Plan fijo `starter`** para todos los tenants en MVP; el enforcement de límites vive en backend (`TRD.md` §11.1).

Mapa slice → criterios de aceptación (`PRD.md` §14):

| Slice | Cierra | Criterios §14 |
| ----- | ------ | ------------- |
| A | Company + Proveedores | 1, 2, 3, 9 |
| B | RFQ + Email + Respuesta pública | 4, 5 |
| C | Comparador + Cierre | 6, 7, 8 |
| D | Dashboard + Landing + Piloto E2E | north star E2E |

---

## 3. Fase 0 — Fundaciones (semana 1, transversal)

Prerrequisito de todos los slices. Sin features de negocio.

### 0.1 Infraestructura local

- [ ] Crear `docker-compose.yml` en raíz con `db` (postgres:16-alpine), `back`, `front` (`TRD.md` §13).
- [ ] `back/.env` desde `.env.example`; validar carga vía `pydantic-settings` (`TRD.md` §3.4).
- [ ] `front/.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` y `NEXT_PUBLIC_APP_URL` (`TRD.md` §6.7).
- [ ] Arranque: `alembic upgrade head` al iniciar el contenedor back.

### 0.2 Base de datos y mixins (backend)

- [ ] Separar en `app/core/db/mixins.py`: `UUIDMixin`, `TimestampMixin`, `SoftDeleteMixin`, `TenantMixin` (`back-schema.md` §8).
- [ ] `Base` declarativa común en `app/core/db/base.py`.
- [ ] Primera migración de fundaciones: `CREATE EXTENSION IF NOT EXISTS pgcrypto;` (`back-schema.md` §1).
- [ ] Repositorio base que inyecta `WHERE company_id = :tenant` + `deleted_at IS NULL` por defecto (`back-schema.md` §6).

### 0.3 Reconciliación de routing i18n (frontend) — **decisión bloqueante**

- [ ] Alinear estructura de `app/` con `next-intl`: adoptar `[locale]/(app|auth)` (como asume `TRD.md` §6.1) **o** documentar `localePrefix: 'as-needed'` sin carpeta locale. Consultar `node_modules/next/dist/docs/` (ver `front/AGENTS.md`) antes de mover carpetas.
- [ ] Middleware (`middleware.ts`) con las 4 reglas de `TRD.md` §6.4 (guard `(app)`, redirect `(auth)`, gate `onboarding_done`, passthrough `respond/*`).

### 0.4 Convenciones y estructura frontend

- [ ] Consolidar librería de componentes: una sola convención (atomic design de `TRD.md` §6.1) y eliminar duplicados `ui/` ↔ `atoms/` y `layout/` ↔ `organisms/`.
- [ ] Crear andamiaje: `services/fetchers/`, `hooks/`, `types/`, `constants/` (`ROUTES`, `PLAN_LIMITS`, `STATUS_LABELS`, `nav-config`).
- [ ] Cliente fetch tipado con manejo de cookie httpOnly y errores `{ detail }` (`TRD.md` §6.4).

### 0.5 Calidad y CI

- [ ] Backend: `ruff check/format`, `pytest` con BD de test `cotizame_test` (`TRD.md` §10).
- [ ] Frontend: `tsc --noEmit`, `eslint`, `bun run build`.
- [ ] Pipeline CI con los 5 pasos de `TRD.md` §12.
- [ ] Convención de ramas y commits (Conventional Commits, `TRD.md` §12).

**Hecho cuando:** `docker compose up` levanta db+back+front; `/health` responde; migraciones corren; lint+build verdes en local y CI.

---

## 4. Slice A — Company + Proveedores (semanas 1–3)

**Valida:** el comprador arma su base de proveedores dentro de los límites del plan.
**Tablas** (`back-schema.md` §4): `companies`, `users`, `password_reset_tokens`, `suppliers`.

### Backend

- [ ] **Módulo `companies`** (Clean Architecture, `TRD.md` §3.1): entidad, puerto, modelo SQLAlchemy, repositorio, router.
- [ ] Migración `companies` (antes que todo por FK, `back-schema.md` §8 orden).
- [ ] **Completar `auth`**: `infrastructure/` (repo), registro transaccional que crea `company` + `user` owner en la misma transacción (`back-schema.md` §4.2), login JWT, forgot/reset password con `password_reset_tokens`, `GET /me` con shape de `TRD.md` §5.1.
- [ ] Tokens JWT HS256 access (30m) + refresh stateless (`TRD.md` §7.1); cookies httpOnly.
- [ ] Endpoint onboarding: `PATCH /companies/:id` con `onboarding_done`, moneda, timezone (`PRD.md` F-AUTH-04).
- [ ] **Módulo `suppliers`**: CRUD completo + búsqueda paginada + soft delete.
- [ ] **Enforcement límite plan**: rechazar 4.º proveedor en `starter` con `HTTP 402` (`TRD.md` §11.1). *(Nota: PRD §5 menciona 403/422; el código canónico es 402 de `TRD.md` §11.1 — unificar en implementación.)*
- [ ] Endpoints: Auth `TRD.md` §5.1, Companies §5.2, Suppliers §5.3.

### Frontend

- [ ] Rutas auth: `/login`, `/register`, `/forgot-password`, `/reset-password` (`PRD.md` §9), con `react-hook-form` + validación + errores 422 inline.
- [ ] `/onboarding/setup` (moneda, timezone, logo opcional).
- [ ] Shell `(app)` con sidebar + header (`ui-spec.md` §5.4); ocultar nav de fases posteriores (history/reports/settings avanzados).
- [ ] `/suppliers` (tabla + búsqueda + empty state + banner de límite) y `/suppliers/:id` (detalle sin stats en MVP).
- [ ] Modal/pantalla crear-editar proveedor; bloqueo de UI al alcanzar límite (refuerzo, no única barrera).
- [ ] Textos en `messages/{es,en}.json`; léxico de `brand-brief.md` §4.

### Tests

- [ ] Integración: registro→login→me, CRUD proveedor, rechazo de límite (402).
- [ ] **Aislamiento multi-tenant**: tenant A no ve proveedores de tenant B (`PRD.md` §14 crit. 9).

**Hecho cuando:** criterios 1, 2, 3 y 9 de `PRD.md` §14 pasan.

---

## 5. Slice B — RFQ + Email + Respuesta pública (semanas 4–7)

**Valida:** el proveedor responde sin cuenta vía email con link único.
**Tablas:** `rfqs`, `rfq_items`, `rfq_suppliers` (`back-schema.md` §4.5–4.7).

### Backend

- [ ] **Módulo `rfq`**: crear borrador con ítems embebidos, actualización progresiva (proveedores, config), estados `draft|sent|closed|expired` (`TRD.md` §11.2), listado con filtro+paginación.
- [ ] `POST /rfq/:id/send`: genera `rfq_suppliers.token` (`secrets.token_urlsafe(32)`, `TRD.md` §11.4), marca `sent`, dispara emails.
- [ ] **Módulo `responses`** (parcial en este slice): endpoints públicos `GET /respond/:token/validate` y `POST /respond/:token/submit` (`TRD.md` §5.6), sin auth, validación de token (expiración `deadline + 24h`, uso único, `TRD.md` §7.2).
- [ ] **Email transaccional** (Resend/SendGrid): plantillas bienvenida, RFQ a proveedor con link, reset password (`TRD.md` §8). Envío non-blocking vía `asyncio` (Celery se difiere a V2).
- [ ] SPF/DKIM/DMARC del dominio antes del primer envío real (`PRD.md` §7.7) — prerequisito de piloto, no de dev.

### Frontend

- [ ] `/rfq` (lista con badges de estado, `ui-spec.md` §5.7) y `/rfq/new` + edición por pasos (`ui-spec.md` §5.8). *(El wizard de 4 pasos es opcional en MVP: `PRD.md` §11 lo marca fuera de alcance como "wizard 4 pasos"; usar formulario único o wizard simplificado según F-RFQ-01.)*
- [ ] `/rfq/:id`: detalle + estado de respuestas por proveedor; acciones cerrar / captura manual.
- [ ] **Rutas públicas** `respond/[token]` (formulario responsive mobile-first, WCAG AA, `ui-spec.md` §5.11), `respond/[token]/success`, `respond/error`.
- [ ] Formato de moneda/fecha con `Intl` según empresa (`TRD.md` §6.5).

### Tests

- [ ] Integración: crear→enviar RFQ, validar token (404/410), submit público, doble submit rechazado.
- [ ] Rate limiting `POST /respond/:token/submit` (`TRD.md` §7.7).
- [ ] E2E parcial (Playwright): comprador crea RFQ → proveedor abre link → responde.

**Hecho cuando:** criterios 4 y 5 de `PRD.md` §14 pasan.

---

## 6. Slice C — Comparador + Cierre (semanas 8–10)

**Valida:** el comprador decide con datos comparables y cierra la RFQ.
**Tablas:** `responses`, `response_items` (`back-schema.md` §4.8–4.9).

### Backend

- [ ] Completar `responses`: captura manual `POST /rfq/:id/responses` (`source=manual`), listado.
- [ ] `GET /rfq/:id/compare`: ranking por precio total ascendente; `total_price NULL` al final; mejor global (`TRD.md` §11.3, reglas `PRD.md` §6.5).
- [ ] Selección de ganador `PATCH /rfq/:id { winner_id }` con auditoría `winner_selected_by/at` (`back-schema.md` §4.5) y cierre a `closed`.
- [ ] Validación de moneda: respuesta con moneda distinta a la RFQ se rechaza (`PRD.md` §6.5).
- [ ] Job/expiración: `sent → expired` cuando `deadline < now()` (job simple; nocturno formal en V2).

### Frontend

- [ ] `/rfq/:id/compare`: tabla comparativa + vista resumen (total por proveedor + ranking), columna ganadora destacada (`ui-spec.md` §5.10). Mix óptimo por ítem se difiere a V2.
- [ ] Captura manual desde el detalle (mismo formulario que el proveedor).
- [ ] Seleccionar ganador con modal de confirmación; no depender solo de color (WCAG, `ui-spec.md` §7).

### Tests

- [ ] Comparador: ranking correcto, respuesta parcial, empate, mínimo ≥2 respuestas (`PRD.md` §6.5).
- [ ] Selección de ganador + transición de estado.

**Hecho cuando:** criterios 6, 7 y 8 de `PRD.md` §14 pasan.

---

## 7. Slice D — Dashboard + Landing + Piloto E2E (semanas 11–12)

**Valida:** producto usable en producción con pilotos reales.

### Backend

- [ ] `GET /dashboard/summary` (`TRD.md` §5.7): `active_rfqs`, `pending_responses`, `suppliers_count`, `recent_rfqs`. `monthly_savings`/`recent_activity` pueden ir `null`/`[]`.
- [ ] Deploy: contenedor back + Postgres gestionado; migraciones en arranque; HTTPS obligatorio (`PRD.md` §7.2).
- [ ] Verificar deliverability de email (bounces/spam, `PRD.md` §7.7).

### Frontend

- [ ] `/dashboard`: KPIs + lista de RFQs recientes + CTA "Nueva cotización" (`ui-spec.md` §5.5). Ocultar bloque ahorro si `monthly_savings === null`.
- [ ] Landing mínima `/`: propuesta de valor + CTA registro (tagline `brand-brief.md` §2).
- [ ] Deploy frontend (Vercel u equivalente) apuntando al API productivo.

### Piloto (paralelo, `PRD.md` §15 playbook)

- [ ] Términos de uso + aviso de privacidad (Ley 1581, `PRD.md` §7.8) publicados antes de pilotos.
- [ ] Onboarding 1–2 empresas piloto reales; primera RFQ en <10 min.
- [ ] Check-in quincenal de métricas (`PRD.md` §13 fase piloto).

**Hecho cuando:** criterio 9 verde y ≥1 piloto completa el north star end-to-end (RFQ con ≥2 respuestas y ganador registrado).

---

## 8. Checklist transversal (aplica a cada slice)

| Categoría | Regla | Fuente |
| --------- | ----- | ------ |
| Multi-tenant | `company_id` del JWT, nunca del body; filtro por defecto en repo | `TRD.md` §7.5, `back-schema.md` §6 |
| Seguridad | bcrypt ≥12, JWT HS256, rate limiting auth, HTTPS, validación Pydantic + `sanitize-html` | `TRD.md` §7 |
| i18n | `es`/`en`, sin strings hardcodeados, `Intl` para moneda/fecha | `TRD.md` §6.5 |
| Accesibilidad | WCAG AA en `respond/*`, badge con texto, touch 44px móvil | `ui-spec.md` §7 |
| Datos | UUID v4, soft delete, timestamps, snake_case | `back-schema.md` §1 |
| Código FE | arrow functions, imports agrupados, ≤250 líneas/archivo, mapping objects | `TRD.md` §6.2 |
| Migraciones | Alembic autogenerate revisado; nunca modificar migración aplicada | `TRD.md` §9 |
| Tests | integración por endpoint MVP + aislamiento tenant obligatorio | `TRD.md` §10 |

---

## 9. Fuera de alcance del MVP (no construir todavía)

WhatsApp, IA de extracción, adjuntos PDF, reportes/analytics, historial, import CSV,
multi-usuario/equipo, facturación real, recordatorios (manual y auto), timeline de
actividad, stats de proveedor, notificaciones in-app, Celery/Redis, SLA contractual.
Detalle y fase destino en `PRD.md` §11 y `TRD.md` §1.

---

## 10. Riesgos de ejecución (implementación)

| Riesgo | Mitigación en el plan |
| ------ | --------------------- |
| Deriva de contratos API entre FE y BE | Contrato fijado en `TRD.md` §5 antes de codear el slice; tests de contrato (`TRD.md` §10) |
| Duplicidad de componentes FE crece | Consolidar en Fase 0.4 antes de features |
| Reconciliación i18n tardía rompe rutas | Resolver en Fase 0.3 (bloqueante) |
| Deliverability de email en piloto | SPF/DKIM/DMARC en Slice B; monitoreo bounces en Slice D |
| Scope creep hacia V2 | Cada tarea anclada a criterio §14 y a "fuera de alcance" §9 |

---

_Plan derivado de `PRD.md` §15 (vertical slices), `TRD.md` (arquitectura) y `back-schema.md` (datos), contrastado con el estado real del repo el 2026-07-22._
