# App Flow — CotizaMe

**Versión:** 1.1
**Fecha:** 2026-06-03
**Referencias:** `TRD.md`, `user-flow.md`, `PRD.md`, `brand-brief.md`, `ui-spec.md`

> Documento de flujo completo de la aplicación: pantallas, transiciones, API, estados y **convenciones UI** (shell, componentes, a11y).
> Los wireframes ASCII son referencia visual; el copy y tono en `brand-brief.md`; color/tipo por pantalla en `ui-spec.md` (ver §1.2–1.3).
> **MVP** = meses 1–3. **V2/V3** = fase futura.

---

## Índice

1. [Mapa de Rutas](#1-mapa-de-rutas) — [Shell](#11-shell-y-navegación), [Convenciones UI](#12-convenciones-ui), [Sistema visual](#13-sistema-visual)
2. [Actores y Contextos de Sesión](#2-actores-y-contextos-de-sesión)
3. [Flujo: Autenticación](#3-flujo-autenticación)
4. [Flujo: Onboarding](#4-flujo-onboarding)
5. [Flujo: Dashboard](#5-flujo-dashboard)
6. [Flujo: Gestión de Proveedores](#6-flujo-gestión-de-proveedores)
7. [Flujo: Crear y Enviar RFQ](#7-flujo-crear-y-enviar-rfq)
8. [Flujo: Tracking de RFQ](#8-flujo-tracking-de-rfq)
9. [Flujo: Respuesta del Proveedor (Público)](#9-flujo-respuesta-del-proveedor-público)
10. [Flujo: Captura Manual de Respuesta](#10-flujo-captura-manual-de-respuesta)
11. [Flujo: Comparador y Cierre](#11-flujo-comparador-y-cierre)
12. [Flujo: Configuración](#12-flujo-configuración)
13. [Flujo: Recuperar Contraseña](#13-flujo-recuperar-contraseña)
14. [Estados Globales y Transiciones](#14-estados-globales-y-transiciones)
15. [Casos de Error y Redirecciones](#15-casos-de-error-y-redirecciones)

---

## 1. Mapa de Rutas

```
app.cotizame.co/
│
├── [locale]/                      (es | en, default: es)
│   │
│   ├── (landing)
│   │   └── /                      → Landing page
│   │
│   ├── (auth)                     [Público — redirige a /dashboard si hay sesión]
│   │   ├── /login
│   │   ├── /register
│   │   ├── /forgot-password
│   │   └── /reset-password
│   │
│   ├── respond/                   [Público — sin auth]
│   │   ├── error                  → Token inválido / expirado / ya usado (?reason=)
│   │   └── [token]/
│   │       ├── /                  → Formulario proveedor
│   │       └── /success
│   │
│   └── (app)                      [Privado — ver middleware]
│       │
│       ├── /dashboard
│       │
│       ├── /rfq
│       │   ├── /                  → Lista de RFQs
│       │   ├── /new               → Wizard paso 1 (ítems)
│       │   └── /[id]
│       │       ├── /              → Detalle + estado respuestas
│       │       ├── /edit          → Wizard pasos 2–4 (?step=)
│       │       └── /compare       → Comparador
│       │
│       ├── /suppliers
│       │   ├── /                  → Lista proveedores
│       │   └── /[id]              → Detalle proveedor
│       │
│       ├── /history               → Historial (V2 — no en sidebar MVP)
│       ├── /reports               → Reportes (V3 — no en sidebar MVP)
│       │
│       ├── /onboarding
│       │   ├── /setup             → Setup empresa (post-registro)
│       │   └── /plan              → Selección plan (V2)
│       │
│       └── /settings
│           ├── /company
│           ├── /team              (V2 — Professional+)
│           ├── /templates         (V2 — Business+)
│           └── /billing           (V2)
```

### Middleware de Next.js

```
Request entrante
       │
       ▼
¿Ruta respond/* ?
   └── SÍ → continúa (validación por token en API)
       │
¿Ruta (auth)?
   ├── SÍ → ¿cookie access_token válida?
   │              ├── SÍ → redirect /[locale]/dashboard
   │              └── NO → continúa
       │
¿Ruta (app)?
   ├── NO → continúa
   └── SÍ → ¿cookie access_token válida?
              ├── NO → redirect /[locale]/login
              └── SÍ → ¿onboarding_done? (GET /me o claim)
                        ├── NO y ruta ≠ /onboarding/* → redirect /onboarding/setup
                        └── SÍ → continúa
```

---

### 1.1 Shell y navegación

Layout `(app)/layout.tsx`: **Sidebar** + **Header** (sin sidebar en `(auth)`, `respond/`, landing).

| Ruta                | Grupo sidebar | Label nav     | Título header      | CTA accent (Header) | MVP         |
| ------------------- | ------------- | ------------- | ------------------ | ------------------- | ----------- |
| `/dashboard`        | Principal     | Dashboard     | Dashboard          | Nueva cotización    | ✅          |
| `/rfq`              | Principal     | Solicitudes   | Solicitudes        | Nueva cotización    | ✅          |
| `/suppliers`        | Principal     | Proveedores   | Proveedores        | Agregar proveedor   | ✅          |
| `/settings/company` | Cuenta        | Configuración | Configuración      | —                   | ✅          |
| `/history`          | Análisis      | Historial     | —                  | —                   | V2 (oculto) |
| `/reports`          | Análisis      | Reportes      | —                  | —                   | V3 (oculto) |
| `/settings/team`    | Cuenta        | Equipo        | Equipo             | Invitar             | V2          |
| `/settings/billing` | Cuenta        | Facturación   | Plan y facturación | —                   | V2          |

- Config en `front/src/constants/nav-config.ts` (≤7 ítems por grupo — Hick).
- **Mobile (MVP):** Sidebar colapsable en drawer; filas de lista y CTAs ≥44px altura táctil.
- Header: título de página, slot `action` (CTA accent), iconos Search (deshabilitado MVP) y Bell (**oculto MVP**; V2 con badge).

---

### 1.2 Convenciones UI

**i18n:** Textos de wireframes → claves en `messages/es.json` y `en.json`. Moneda/fecha con `Intl` + `company.currency` / `company.timezone` de sesión.

**Estados por pantalla (patrón):**

| Estado           | Componente                             | Cuándo                                |
| ---------------- | -------------------------------------- | ------------------------------------- |
| Loading          | `Skeleton`                             | Fetch inicial (listas, KPIs, detalle) |
| Empty            | `EmptyState`                           | `data.length === 0`                   |
| Error red        | Toast + retry                          | Timeout / 5xx                         |
| Error validación | Inline `role="alert"` + `aria-invalid` | 422                                   |
| Error recurso    | Página o `EmptyState`                  | 404 tenant                            |

**Matriz flujo → componentes (catálogo):**

| Flujo                      | Componentes principales                                       |
| -------------------------- | ------------------------------------------------------------- |
| Auth, onboarding, settings | `Input`, `Label`, `Button`, `Form` (RHF), `Card`              |
| Dashboard                  | `Card`, `Badge`, `Skeleton`, `EmptyState`                     |
| Proveedores                | `DataTable`, `Dialog`, `Toast`, `EmptyState`                  |
| Wizard RFQ                 | `rfq-wizard` (organism), `Dialog` (proveedor inline), `Toast` |
| Detalle RFQ                | `Badge`, `Dialog` (respuesta manual), `Button`                |
| Comparador                 | `compare-table` / `DataTable` (sticky, `tabular-nums`)        |
| Respond público            | `Input`, layout sin shell; errores → `/respond/error`         |

**Accesibilidad (WCAG 2.1 AA):** `:focus-visible` global; badges con texto (no solo color); iconos decorativos `aria-hidden`; botones solo icono con `sr-only`; tablas con `th scope="col"`; toasts `aria-live="polite"` (errores críticos `assertive`); respetar `prefers-reduced-motion`.

**CTA accent:** Un solo CTA de máxima énfasis por vista (`variant=accent` o `primary`): p. ej. Enviar cotización, Confirmar y cerrar, Continuar onboarding.

---

### 1.3 Sistema visual

Detalle completo en **`ui-spec.md`** (tokens por pantalla) y **`brand-brief.md`** (voz y dirección de marca).

| Recurso                     | Contenido                                                       |
| --------------------------- | --------------------------------------------------------------- |
| `brand-brief.md`            | Positioning, tagline es/en, léxico RFQ, tono por superficie     |
| `ui-spec.md`                | Color y tipografía por vista, CTAs, comparador, respond público |
| `color-tokens.json`         | Export hex + status badges (Figma)                              |
| `type-tokens.json`          | Escala modular + familias                                       |
| `front/src/app/globals.css` | Implementación runtime                                          |

**Badge dominio → CSS:** `responded` → variant `answered`; `expired` → `overdue` (tabla en `ui-spec.md` §4).

---

## 2. Actores y Contextos de Sesión

| Actor                              | Autenticación                                | company_id en JWT | Acceso                |
| ---------------------------------- | -------------------------------------------- | ----------------- | --------------------- |
| **Comprador** (owner/admin/member) | JWT access + refresh                         | ✅ propio tenant  | Rutas `(app)`         |
| **Proveedor externo**              | Token URL (`rfq_suppliers.token`, ~43 chars) | —                 | Solo `respond/:token` |
| _(futuro) Admin_                   | JWT con rol `admin`                          | —                 | Panel admin           |

### Contexto de sesión disponible en toda la app privada

```typescript
// Alineado con GET /api/v1/auth/me (TRD §5.1)
interface SessionContext {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: "owner" | "admin" | "member";
  };
  company: {
    id: string;
    name: string;
    plan_id: "starter" | "professional" | "business" | "enterprise";
    currency: string;
    timezone: string;
    onboarding_done: boolean;
  };
}
```

Cargado al montar `(app)/layout.tsx` via `GET /api/v1/auth/me`.

---

## 3. Flujo: Autenticación

### 3.1 Registro

```
Usuario → /register
              │
              ▼
    [SCREEN] Formulario de registro
    ┌─────────────────────────────┐
    │ Nombre completo             │
    │ Email                       │
    │ Contraseña (min 8 chars)    │
    │ Nombre de empresa           │
    │ País (select)               │
    │ Industria (select)          │
    │ [Registrarse]               │
    └─────────────────────────────┘
              │
              ▼
    POST /api/v1/auth/register
    Body: { full_name, email, password, company_name, country, industry }
              │
    ┌─────────┴─────────┐
    │ 201 Created       │ 422 / 409
    ▼                   ▼
  Guarda               Muestra error inline
  access_token +       (email ya existe,
  refresh_token        contraseña débil, etc.)
  en httpOnly cookie
              │
              ▼
    redirect → /onboarding/setup
```

**Campos requeridos:** `full_name`, `email`, `password`, `company_name`
**Campos opcionales:** `country` (default: CO), `industry`
**Errores posibles:**

- `409` Email ya registrado → "Este email ya tiene una cuenta. [Iniciar sesión]"
- `422` Validación → mensaje por campo

---

### 3.2 Login

```
Usuario → /login
              │
              ▼
    [SCREEN] Formulario de login
    ┌──────────────────────────┐
    │ Email                    │
    │ Contraseña               │
    │ [Ingresar]               │
    │ ¿Olvidaste tu contraseña?│
    └──────────────────────────┘
              │
              ▼
    POST /api/v1/auth/login
    Body: { email, password }
              │
    ┌─────────┴──────────────────┐
    │ 200 OK                     │ 401
    ▼                            ▼
  Guarda tokens              "Email o contraseña
  en httpOnly cookie          incorrectos"
              │
              ▼
    redirect → /dashboard
    (o URL previa si fue redirigido desde middleware)
```

---

### 3.3 Logout

```
Cualquier pantalla → Header → [Cerrar sesión]
              │
              ▼
    Elimina cookies del cliente
    (POST /api/v1/auth/logout → opcional, en MVP basta limpiar cliente)
              │
              ▼
    redirect → /login
```

---

## 4. Flujo: Onboarding

Se ejecuta **una sola vez** después del registro. Si el usuario intenta saltarlo, el middleware verifica si `company.onboarding_done` es falso y redirige de vuelta.

```
POST /register exitoso
              │
              ▼
    [SCREEN] /onboarding/setup
    ┌──────────────────────────────────────────┐
    │  Configura tu empresa                    │
    │                                          │
    │  Nombre de empresa   [pre-llenado]        │
    │  Moneda predeterminada: [COP ▼]          │
    │  Zona horaria: [America/Bogota ▼]        │
    │                                          │
    │  [Continuar al dashboard →]              │
    └──────────────────────────────────────────┘
              │
              ▼
    PATCH /api/v1/companies/:id
    Body: { name, currency, timezone, onboarding_done: true }
              │
              ▼
    redirect → /dashboard
```

**UI:** `Skeleton` al guardar; Toast en error de red; CTA `[Continuar al dashboard]` = accent único.

**Nota MVP:** No hay selección de plan en el onboarding MVP. El plan `starter` se asigna automáticamente al registrar. La pantalla `/onboarding/plan` se habilita en V2.

---

## 5. Flujo: Dashboard

```
Comprador → /dashboard
              │
              ▼
    GET /api/v1/dashboard/summary
    Response: {
      active_rfqs,
      pending_responses,
      suppliers_count,
      recent_rfqs: [...],
      monthly_savings: null,      // MVP: ocultar KPI si null
      recent_activity: []         // V2: feed de actividad
    }
              │
              ▼
    [SCREEN] Dashboard
    ┌────────────────────────────────────────────────┐
    │ [+ Nueva Cotización]              (Bell: V2)   │
    ├────────────┬──────────────┬───────────────────┤
    │ RFQs       │ Respuestas   │ Proveedores       │
    │ activas: 5 │ pendientes:12│ registrados: 8    │
    ├────────────┴──────────────┴───────────────────┤
    │ Solicitudes recientes                          │
    │  • Compra papelería Q3  [sent]   2/3 respuestas│
    │  • Insumos limpieza     [draft]  —             │
    │  • Equipos cómputo      [closed] 3/3 ✓ XYZ    │
    └────────────────────────────────────────────────┘
```

**UI:** `Skeleton` en 3 KPIs y lista mientras carga; `EmptyState` en recientes si `recent_rfqs` vacío; badges de estado con `<Badge variant="draft|sent|closed" />`.

**Acciones desde dashboard:**

- Click `[+ Nueva Cotización]` → `/rfq/new`
- Click en una RFQ → `/rfq/:id`
- Click en KPI proveedores → `/suppliers`

---

## 6. Flujo: Gestión de Proveedores

### 6.1 Lista de Proveedores

```
/suppliers
    │
    ▼
GET /api/v1/suppliers?page=1&limit=20&search=&category=
    │
    ▼
[SCREEN] Lista de proveedores
┌─────────────────────────────────────────────────────┐
│ Proveedores                          [+ Agregar]    │
│ [Buscar por nombre...]  [Categoría ▼]               │
├─────────────────────────────────────────────────────┤
│ Nombre          │ Categoría    │ Email       │ Acc. │
│ Papelería Norte │ papelería    │ ven@...co   │ ···  │
│ Tech Store      │ tecnología   │ info@...co  │ ···  │
├─────────────────────────────────────────────────────┤
│ Plan Starter: 2/3 proveedores usados                │
│ [Actualizar plan para agregar más]  ← badge si =3  │
└─────────────────────────────────────────────────────┘
```

**Límite de plan visible:**

- Starter: badge con `X/3 proveedores`
- Al llegar al límite: botón `[+ Agregar]` deshabilitado con tooltip "Límite de plan alcanzado"

**UI:** `DataTable` + búsqueda; `EmptyState` si no hay proveedores; `Skeleton` en carga; `402` → Toast con `upgrade_required` (TRD).

---

### 6.2 Crear Proveedor

```
Click [+ Agregar]
    │
    ├── ¿Plan con cupo disponible?
    │       │
    │       ├── SÍ → Abre modal / panel lateral
    │       │
    │       └── NO → Modal de upgrade (V2)
    │               En MVP: toast "Has alcanzado el límite de tu plan"
    │
    ▼
[MODAL] Nuevo proveedor
┌─────────────────────────────────┐
│ Nombre *               [input]  │
│ Email                  [input]  │
│ Teléfono               [input]  │
│ WhatsApp               [input]  │
│ Nombre de contacto     [input]  │
│ Categorías             [tags]   │
│ Notas                  [area]   │
│                                 │
│          [Cancelar] [Guardar]   │
└─────────────────────────────────┘
    │
    ▼
POST /api/v1/suppliers
Body: { name, email, phone, whatsapp, contact_name, categories[], notes }
    │
┌───┴──────────────────┐
│ 201 Created          │ 402 límite
▼                      ▼
Cierra modal        Toast error
Agrega a lista      "Límite de plan"
Toast "Proveedor
creado"
```

---

### 6.3 Detalle de Proveedor

```
Click en proveedor
    │
    ▼
GET /api/v1/suppliers/:id
    │
    ▼
[SCREEN] /suppliers/:id
┌──────────────────────────────────────────┐
│ ← Proveedores                            │
│ Papelería Norte           [Editar] [···] │
├──────────────────────────────────────────┤
│ Email: ventas@norte.co                   │
│ WhatsApp: +57 300...                     │
│ Categorías: papelería, oficina           │
│ Notas: Pago a 30 días                    │
├──────────────────────────────────────────┤
│ Historial de cotizaciones    (V2)        │
│ Estadísticas                 (V2)        │
└──────────────────────────────────────────┘
```

**Acciones del menú `···`:**

- Editar → `PATCH /api/v1/suppliers/:id`
- Eliminar → confirmación → `DELETE /api/v1/suppliers/:id` (soft delete)

---

## 7. Flujo: Crear y Enviar RFQ

El flujo de creación es un **wizard de 4 pasos**. El borrador se guarda en backend desde el paso 1.

```
/dashboard → [+ Nueva Cotización] → /rfq/new
```

---

### Paso 1 — Ítems

```
[SCREEN] /rfq/new  (step: items)
┌────────────────────────────────────────────────────┐
│ Nueva Solicitud de Cotización         Paso 1 de 4  │
│                                                    │
│ Título *                                           │
│ [Compra de insumos Q3              ]               │
│                                                    │
│ Ítems a cotizar                                    │
│ ┌──────────────────────────────────────────────┐   │
│ │ Nombre *      Cantidad *  Unidad  Descripción│   │
│ │ [Resma A4 ] [    10    ] [unidad] [75g, ...]  │   │
│ │ [+Agregar ítem]                               │   │
│ └──────────────────────────────────────────────┘   │
│                                   [Siguiente →]    │
└────────────────────────────────────────────────────┘
    │
    ▼ (al click "Siguiente")
POST /api/v1/rfq
Body: { title, items: [{ name, quantity, unit, description, sort_order }] }
Response: { id: "uuid", status: "draft" }
    │
    ▼
Guarda rfq.id en estado local
redirect → /rfq/[id]/edit?step=suppliers
```

---

### Paso 2 — Proveedores

```
[SCREEN] /rfq/[id]/edit  (step: suppliers)
┌────────────────────────────────────────────────────┐
│ Nueva Solicitud de Cotización         Paso 2 de 4  │
│                                                    │
│ Selecciona los proveedores a contactar             │
│ [Buscar proveedor...]                              │
│                                                    │
│ ☐ Papelería Norte   ventas@norte.co               │
│ ☑ Tech Store        info@tech.co                  │
│ ☑ Suministros SAS   contacto@sum.co               │
│                                                    │
│ [+ Crear proveedor nuevo]                          │
│                                                    │
│ Seleccionados: 2                                   │
│ [← Anterior]                    [Siguiente →]     │
└────────────────────────────────────────────────────┘
    │
    ▼ (al click "Siguiente")
PATCH /api/v1/rfq/:id
Body: { supplier_ids: ["uuid1", "uuid2"] }
    │
    ▼
redirect → /rfq/[id]/edit?step=config
```

**Crear proveedor inline:** abre el mismo modal del flujo 6.2, y al guardar regresa al paso 2 con el nuevo proveedor ya seleccionado.

---

### Paso 3 — Configuración

```
[SCREEN] /rfq/[id]/edit  (step: config)
┌────────────────────────────────────────────────────┐
│ Nueva Solicitud de Cotización         Paso 3 de 4  │
│                                                    │
│ Fecha límite de respuesta                          │
│ [15/06/2026        ] [23:59 ▼]                     │
│                                                    │
│ Moneda   [COP ▼]                                   │
│                                                    │
│ Canal de envío                                     │
│ ● Email   ○ WhatsApp (Professional+) [Upgrade →]  │
│                                                    │
│ Mensaje para proveedores                           │
│ [Estimado proveedor, lo invitamos a cotizar...   ] │
│ (plantillas guardadas: V2)                         │
│                                                    │
│ [← Anterior]                    [Siguiente →]     │
└────────────────────────────────────────────────────┘
    │
    ▼ (al click "Siguiente")
PATCH /api/v1/rfq/:id
Body: { deadline, currency, channel: "email", message }
    │
    ▼
redirect → /rfq/[id]/edit?step=review
```

---

### Paso 4 — Revisión y Envío

```
[SCREEN] /rfq/[id]/edit  (step: review)
┌────────────────────────────────────────────────────┐
│ Nueva Solicitud de Cotización         Paso 4 de 4  │
│                                                    │
│ Resumen                                            │
│  Título: Compra de insumos Q3                      │
│  Ítems: 3   Proveedores: 2   Límite: 15/06/2026    │
│                                                    │
│ Se enviará a:                                      │
│  • Tech Store — info@tech.co                       │
│  • Suministros SAS — contacto@sum.co               │
│                                                    │
│ Preview del email: (V2)                            │
│                                                    │
│ [← Anterior]              [Enviar cotización →]   │
└────────────────────────────────────────────────────┘
    │
    ▼ (al click "Enviar cotización")
POST /api/v1/rfq/:id/send
    │
┌───┴──────────────────────────────────┐
│ 200 OK                               │ Error
│ { sent_count: 2, failed_count: 0 }   │
▼                                      ▼
Toast "Cotización enviada a 2          Toast "Fallo al enviar
proveedores"                           a X proveedores"
redirect → /rfq/:id
```

**Backend al ejecutar `/send`:**

1. Cambia `rfq.status = "sent"`, registra `rfq.sent_at`
2. Para cada `rfq_supplier`: genera token único → `rfq_suppliers.token`
3. Envía email a cada proveedor con link `https://app.cotizame.co/respond/<token>`
4. Actualiza `rfq_suppliers.status = "sent"`, `sent_at = now()` (token: `secrets.token_urlsafe(32)` — TRD §11.4)

### Reglas del wizard (pasos 2–4)

| Acción            | Comportamiento                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| **Siguiente**     | Deshabilitado + loading mientras `POST`/`PATCH`; errores 422 inline                            |
| **Anterior**      | Solo cambia `?step=`; no re-guarda (datos ya persistidos en backend)                           |
| **Enviar**        | Loading en botón; Toast al terminar; redirect inmediato (optimistic opcional en lista destino) |
| **Mobile paso 1** | Tabla de ítems en cards apiladas (una fila = un card)                                          |

---

## 8. Flujo: Tracking de RFQ

### 8.0 Lista de RFQs

```
/rfq
    │
    ▼
GET /api/v1/rfq?page=1&limit=20&status=&search=
    │
    ▼
[SCREEN] Lista — DataTable con título, Badge estado, respuestas X/Y, fecha límite
```

**UI:** `EmptyState` + CTA "Nueva cotización" si vacío; `Skeleton` en carga.

---

### 8.1 Detalle y tracking

```
/rfq  →  click en RFQ  →  /rfq/:id
```

```
GET /api/v1/rfq/:id
Response: {
  rfq: { id, title, items, deadline, status, channel, currency },
  supplier_responses: [
    { supplier: { id, name }, status: "pending" | "responded", responded_at },
    ...
  ]
}
```

```
[SCREEN] /rfq/:id
┌──────────────────────────────────────────────────────┐
│ ← Solicitudes          Compra insumos Q3    [sent]   │
├──────────────────────────────────────────────────────┤
│ Límite: 15/06/2026 23:59    Moneda: COP              │
│ Ítems: 3                                             │
├──────────────────────────────────────────────────────┤
│ Estado de respuestas                                 │
│                                                      │
│  [responded] Tech Store     Respondió  12/06 14:23   │
│     [Ver respuesta]                                  │
│                                                      │
│  [pending] Suministros SAS  Pendiente                │
│     [Registrar respuesta manual]  (Recordar: V2)     │
│                                                      │
├──────────────────────────────────────────────────────┤
│ [Ver comparador]    [Cerrar solicitud]               │
│  (≥1 respuesta)     (V2 o cierre sin ganador)        │
└──────────────────────────────────────────────────────┘
```

**Estados de cada fila de proveedor:**

| status      | Badge / label      | Acciones MVP                 |
| ----------- | ------------------ | ---------------------------- |
| `pending`   | `pending`          | [Registrar respuesta manual] |
| `sent`      | `sent`             | [Registrar respuesta manual] |
| `responded` | `responded`        | [Ver respuesta]              |
| `failed`    | `danger` / Fallido | [Reintentar envío]           |

Icono lucide opcional junto al badge (`aria-hidden`). **[Recordar]** solo V2 (no renderizar en MVP).

**Estado global del RFQ:**

| status    | Badge variant | UI                                                |
| --------- | ------------- | ------------------------------------------------- |
| `draft`   | `draft`       | Sin tracking; link a `/rfq/[id]/edit` si borrador |
| `sent`    | `sent`        | Tracking activo                                   |
| `closed`  | `closed`      | Solo lectura + [Ver comparador]                   |
| `expired` | `overdue`     | Sin nuevas respuestas                             |

**UI:** `[Ver comparador]` deshabilitado si 0 respuestas; `Skeleton` al cargar detalle.

---

## 9. Flujo: Respuesta del Proveedor (Público)

Este flujo ocurre **fuera de la sesión de CotizaMe**. El proveedor sigue el link del email.

```
Proveedor recibe email
    │
    ▼
Click en link:  app.cotizame.co/respond/<token>
    │
    ▼
GET /api/v1/respond/:token/validate
    │
    ┌────────────────────────────────────────────────┐
    │ 200 OK → renderiza formulario                  │
    │ 404 → redirect /respond/error?reason=invalid   │
    │ 410 → redirect ?reason=expired|already_submitted│
    └────────────────────────────────────────────────┘
    │ (200 OK)
    ▼
[SCREEN PUBLIC] /respond/:token
┌────────────────────────────────────────────────────┐
│  CotizaMe                                          │
│  Solicitud de cotización de: Empresa S.A.S.        │
│                                                    │
│  Hola, Papelería Norte                             │
│  Por favor cotiza los siguientes ítems:            │
│  Límite: 15 de junio de 2026                       │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ Ítem             Cant. Precio unit. Disponib.│  │
│  │ Resma papel A4    10   [COP      ] [☑ Sí]   │  │
│  │ Lapiceros negros  50   [COP      ] [☑ Sí]   │  │
│  │ Carpetas AZ       20   [COP      ] [☑ Sí]   │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  Tiempo de entrega estimado: [input]               │
│  Notas adicionales:          [textarea]            │
│  Validez de la cotización:   [fecha]               │
│                                                    │
│                        [Enviar cotización →]       │
└────────────────────────────────────────────────────┘
    │
    ▼
POST /api/v1/respond/:token/submit
Body: {
  items: [{ rfq_item_id, unit_price, availability, lead_time, notes }],
  total_price,
  currency: "COP",
  valid_until,
  notes
}
    │
┌───┴─────────────────────────────┐
│ 200 OK                          │ Error
▼                                 ▼
[SCREEN] /respond/:token/success  Errores inline
┌──────────────────────────────┐
│  ✅ ¡Cotización recibida!    │
│                              │
│  Tu cotización fue enviada   │
│  exitosamente.               │
│                              │
│  La empresa Empresa S.A.S.   │
│  revisará tu propuesta.      │
│                              │
│  Gracias por tu tiempo.      │
└──────────────────────────────┘
```

**Backend al recibir `/submit`:**

1. Valida token → busca `rfq_suppliers` por token
2. Verifica `token_used = FALSE` y `rfq.deadline > now()`
3. Crea `responses` + `response_items`
4. Marca `rfq_suppliers.token_used = TRUE`, `responded_at = now()`, `status = "responded"`
5. (V2) Envía email de notificación al comprador

**Pantalla `/respond/error` (layout público, sin shell):**

| `?reason=`          | HTTP origen | Mensaje (i18n)                                                                             |
| ------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `invalid`           | 404         | El enlace no es válido. Verifica que lo hayas copiado correctamente.                       |
| `expired`           | 410         | Esta solicitud ya no acepta respuestas (fecha límite superada).                            |
| `already_submitted` | 410         | Ya enviaste tu cotización para esta solicitud. Solo se acepta una respuesta por proveedor. |

**UI respond:** precios con `tabular-nums`; CTA `[Enviar cotización]` = accent; loading en submit; touch targets ≥44px.

---

## 10. Flujo: Captura Manual de Respuesta

Cuando el proveedor responde por otro canal (llamada, WhatsApp, email fuera del sistema).

```
/rfq/:id  →  fila de proveedor pendiente  →  [Registrar respuesta manual]
    │
    ▼
[MODAL] Registrar respuesta — Suministros SAS
┌────────────────────────────────────────────────────┐
│ Registrando respuesta de: Suministros SAS          │
│                                                    │
│ ┌──────────────────────────────────────────────┐   │
│ │ Ítem             Precio unit. Disponib. Plazo│   │
│ │ Resma papel A4   [80.000 ]   [☑ Sí] [3 días]│   │
│ │ Lapiceros negros [15.000 ]   [☑ Sí] [3 días]│   │
│ │ Carpetas AZ      [25.000 ]   [☑ Sí] [5 días]│   │
│ └──────────────────────────────────────────────┘   │
│                                                    │
│ Total calculado: COP 980.000                       │
│ Notas: [Incluye IVA, pago a 30 días           ]    │
│                                                    │
│              [Cancelar]  [Guardar respuesta]       │
└────────────────────────────────────────────────────┘
    │
    ▼
POST /api/v1/rfq/:id/responses
Body: {
  supplier_id: "uuid",
  items: [...],
  total_price: 980000,
  currency: "COP",
  notes: "Incluye IVA",
  source: "manual"
}
    │
    ▼
Cierra modal
Actualiza estado fila → ✅ Respondió (manual)
Toast "Respuesta registrada"
```

---

## 11. Flujo: Comparador y Cierre

### 11.1 Acceder al Comparador

```
/rfq/:id  →  [Ver comparador]   (activo si ≥1 respuesta)
    │
    ▼
GET /api/v1/rfq/:id/compare
Response: {
  rfq_id, items,
  responses: [
    { supplier, total_price, currency, items: [...], rank },
    ...
  ],
  best_overall_supplier_id
}
```

### 11.2 Vista del Comparador

```
[SCREEN] /rfq/:id/compare
┌─────────────────────────────────────────────────────────────────┐
│ ← Compra insumos Q3                          [Exportar ▼] (V2) │
├───────────────────────┬────────────────┬────────────────────────┤
│ Ítem                  │ Tech Store 🥇  │ Suministros SAS        │
│                       │ COP 800.000    │ COP 980.000            │
├───────────────────────┼────────────────┼────────────────────────┤
│ Resma papel A4 ×10    │ 75.000 ✅      │ 80.000                 │
│ Lapiceros ×50         │ 12.000 ✅      │ 15.000                 │
│ Carpetas AZ ×20       │ 22.000 ✅      │ 25.000                 │
├───────────────────────┼────────────────┼────────────────────────┤
│ TOTAL                 │ 800.000 🥇     │ 980.000                │
│ Plazo entrega         │ 2 días         │ 3 días                 │
├───────────────────────┴────────────────┴────────────────────────┤
│                                                                 │
│ Mejor precio global: Tech Store (ahorro: COP 180.000 vs 2.º)   │
│                                                                 │
│ Seleccionar ganador:                                            │
│ [Seleccionar Tech Store como proveedor]                         │
│ [Seleccionar Suministros SAS como proveedor]                    │
│                                                                 │
│ [← Volver a detalle]                                           │
└─────────────────────────────────────────────────────────────────┘
```

**Reglas de visualización:**

- Proveedor con menor `total_price` → columna resaltada + texto "Mejor precio" + Badge (no depender solo de 🥇)
- Precios con `tabular-nums`; header sticky; `th scope="col"`
- Ítems sin cotizar → "—" (no entra en total)
- 0 respuestas → no debe llegar aquí (botón deshabilitado en detalle); si API vacía → `EmptyState`
- 1 respuesta → tabla sin ranking relativo entre columnas

---

### 11.3 Seleccionar Ganador y Cerrar

```
Click [Seleccionar Tech Store como proveedor]
    │
    ▼
[MODAL] Confirmación
┌───────────────────────────────────────────┐
│ ¿Confirmar selección?                     │
│                                           │
│ Proveedor ganador: Tech Store             │
│ Precio total: COP 800.000                 │
│                                           │
│ Esta acción cerrará la solicitud.         │
│                                           │
│ [Cancelar]         [Confirmar y cerrar]   │
└───────────────────────────────────────────┘
    │
    ▼
PATCH /api/v1/rfq/:id
Body: { winner_id: "tech-store-uuid", status: "closed" }
    │
    ▼
Toast "Proveedor seleccionado. Solicitud cerrada."
redirect → /rfq/:id  (en modo solo lectura)
```

**En `/rfq/:id` después del cierre:**

```
┌──────────────────────────────────────────────────┐
│ Compra insumos Q3                      [closed] ✅│
│                                                  │
│ Proveedor seleccionado: Tech Store               │
│ Precio: COP 800.000                              │
│                                                  │
│ [Ver comparador]  [Exportar] (V2)                │
└──────────────────────────────────────────────────┘
```

---

## 12. Flujo: Configuración

### 12.1 Configuración de Empresa

```
/settings/company
    │
    ▼
GET /api/v1/companies/:id  (company_id del JWT)
    │
    ▼
[SCREEN] Configuración de empresa
┌──────────────────────────────────────────┐
│ Configuración de empresa                 │
├──────────────────────────────────────────┤
│ Nombre de empresa    [Empresa SAS      ] │
│ NIT / RUT            [900.123.456-7    ] │
│ País                 [Colombia ▼       ] │
│ Moneda               [COP ▼            ] │
│ Zona horaria         [America/Bogota ▼ ] │
│                                          │
│                           [Guardar]      │
└──────────────────────────────────────────┘
    │
    ▼
PATCH /api/v1/companies/:id
Toast "Cambios guardados"
```

### 12.2 Gestión de Equipo (V2 — Professional+)

```
/settings/team
    │
    ▼
GET /api/v1/companies/:id/members
    │
    ▼
[SCREEN] Gestión de equipo
┌──────────────────────────────────────────────────┐
│ Equipo                              [+ Invitar]  │
├──────────────────────────────────────────────────┤
│ María López     owner   maria@... [activo]       │
│ Juan Pérez      member  juan@...  [activo]  [···]│
├──────────────────────────────────────────────────┤
│ Plan Professional: 2/3 usuarios                  │
└──────────────────────────────────────────────────┘

[+ Invitar]:
POST /api/v1/companies/:id/members/invite
Body: { email, role: "member" }
→ Envía email de invitación con link de registro
```

### 12.3 Plan y Facturación (V2)

```
/settings/billing
    │
    ▼
GET /api/v1/billing/subscription
    │
    ▼
[SCREEN] Plan y facturación
┌──────────────────────────────────────────────────┐
│ Tu plan actual: Starter (Gratuito)               │
│                                                  │
│ Uso este mes:                                    │
│  Proveedores:  3/3  ████████████ 100%           │
│  RFQs:         4/5  ████████░░░  80%            │
│  Usuarios:     1/1  ████████████ 100%           │
│                                                  │
│ [Actualizar a Professional — $149.000/mes]       │
│                                                  │
├──────────────────────────────────────────────────┤
│ Facturas                                         │
│ (sin historial en plan gratuito)                 │
└──────────────────────────────────────────────────┘
```

---

## 13. Flujo: Recuperar Contraseña

```
/login → [¿Olvidaste tu contraseña?] → /forgot-password
    │
    ▼
[SCREEN] /forgot-password
┌───────────────────────────────────────────┐
│ Recuperar contraseña                      │
│                                           │
│ Email   [maria@empresa.co          ]      │
│                                           │
│             [Enviar instrucciones]        │
└───────────────────────────────────────────┘
    │
    ▼
POST /api/v1/auth/forgot-password
Body: { email }
Response: 200 siempre (no revelar si el email existe)
    │
    ▼
[SCREEN] Mensaje genérico
"Si el email está registrado, recibirás un enlace en los próximos minutos."
    │
    ▼ (backend)
Genera password_reset_tokens.token (UUID, expira en 1h)
Envía email con link:
  https://app.cotizame.co/reset-password?token=<uuid>


Usuario hace click en el email:
    │
    ▼
[SCREEN] /reset-password?token=<uuid>
┌───────────────────────────────────────────┐
│ Nueva contraseña                          │
│                                           │
│ Nueva contraseña     [input password]     │
│ Confirmar contraseña [input password]     │
│                                           │
│                  [Cambiar contraseña]     │
└───────────────────────────────────────────┘
    │
    ▼
POST /api/v1/auth/reset-password
Body: { token: "<uuid>", new_password }
    │
┌───┴───────────────────────┐
│ 200 OK                    │ 410 expirado / 404 inválido
▼                           ▼
Toast "Contraseña           "El enlace no es válido
actualizada"               o ha expirado. Solicita
redirect → /login          uno nuevo."
```

---

## 14. Estados Globales y Transiciones

### 14.1 Máquina de estados del RFQ

```
              ┌──────────────────────────────────────────────────┐
              │                                                  │
  /rfq/new ──▶│  draft  │──▶  POST /rfq/:id/send  ──▶│  sent  │
              │         │                             │        │──▶ PATCH winner_id ──▶│ closed │
              │ (borrador│                             │ activo │──▶ PATCH status=closed ─▶      │
              │  local)  │                             │        │──▶ job nocturno ──────▶│expired│
              └──────────┘                             └────────┘
```

| Transición       | Disparador                      | Pantalla                    |
| ---------------- | ------------------------------- | --------------------------- |
| `→ draft`        | POST /rfq                       | /rfq/new paso 1             |
| `draft → sent`   | POST /rfq/:id/send              | /rfq/new paso 4             |
| `sent → closed`  | PATCH winner_id o status=closed | /rfq/:id/compare o /rfq/:id |
| `sent → expired` | Job nocturno (deadline < now)   | Automático                  |

### 14.2 Estado de respuesta por proveedor

```
pending ──▶ sent (POST /rfq/:id/send) ──▶ responded (POST /respond/:token/submit)
                                     └──▶ failed (error de envío)
```

### 14.3 Límites de plan — comportamiento UI

| Límite alcanzado      | Pantalla       | Comportamiento                                  |
| --------------------- | -------------- | ----------------------------------------------- |
| Max proveedores       | /suppliers     | Botón `[+ Agregar]` disabled + tooltip          |
| Max RFQs              | /rfq/new       | Modal de upgrade antes de crear                 |
| Max usuarios          | /settings/team | Botón `[+ Invitar]` disabled                    |
| Plan no soporta canal | Paso 3 wizard  | Radio WhatsApp disabled + badge "Professional+" |

### 14.4 Notificaciones in-app (V2)

```
Header (bell icon) con badge de contador
    │
    ▼
GET /api/v1/notifications?unread=true
    │
    ▼
[Dropdown]
┌──────────────────────────────────────────┐
│ Notificaciones           [Marcar todo]   │
├──────────────────────────────────────────┤
│ 🔵 Tech Store respondió "Compra Q3"      │
│    hace 5 minutos  [Ver →]               │
│                                          │
│ ⚪ Cotización "Insumos limpieza"         │
│    vence en 24 horas  [Ver →]            │
└──────────────────────────────────────────┘
```

Eventos que generan notificación:

| Evento                  | Tipo                | Destino     |
| ----------------------- | ------------------- | ----------- |
| Proveedor responde      | `response_received` | Comprador   |
| RFQ vence en 24h        | `rfq_expiring`      | Comprador   |
| Recordatorio enviado    | `reminder_sent`     | Comprador   |
| Usuario invitado acepta | `member_joined`     | Owner/Admin |

---

## 15. Casos de Error y Redirecciones

### 15.1 Errores de autenticación

| Caso                               | Comportamiento                                                     |
| ---------------------------------- | ------------------------------------------------------------------ |
| Token expirado durante sesión      | MVP: un intento `POST /auth/refresh`; si falla → redirect `/login` |
| Sesión inválida (cookie corrupta)  | Middleware → redirect `/login`                                     |
| Sin permisos para una acción (rol) | Toast "No tienes permisos para realizar esta acción"               |

### 15.2 Errores de recursos

| Caso                           | HTTP | Comportamiento                                       |
| ------------------------------ | ---- | ---------------------------------------------------- |
| RFQ no existe o de otro tenant | 404  | Página de error "Solicitud no encontrada" + [Volver] |
| Proveedor no existe            | 404  | Página de error                                      |
| Token de proveedor inválido    | 404  | `/respond/error?reason=invalid`                      |
| Token expirado                 | 410  | `/respond/error?reason=expired`                      |
| Token ya usado                 | 410  | `/respond/error?reason=already_submitted`            |

### 15.3 Errores de límite de plan

| Caso                                | HTTP | Comportamiento                                                  |
| ----------------------------------- | ---- | --------------------------------------------------------------- |
| Crear proveedor sobre límite        | 402  | Toast con `detail` + enlace upgrade si `upgrade_required: true` |
| Crear RFQ sobre límite mensual      | 402  | Modal "Límite de RFQs alcanzado este mes"                       |
| Enviar por WhatsApp en plan Starter | 403  | Opción deshabilitada en UI antes de llegar al backend           |

### 15.4 Errores de red / servidor

| Caso                      | Comportamiento                                               |
| ------------------------- | ------------------------------------------------------------ |
| API no responde (timeout) | Toast "Error de conexión. Intenta nuevamente." + botón retry |
| Error 500 del servidor    | Toast "Error interno. Nuestro equipo fue notificado."        |
| Error de validación 422   | Errores inline por campo en el formulario                    |

---

## Resumen de Flujos por Actor

### Comprador — Flujo completo MVP

```
Registro → Onboarding → Dashboard
                            │
                ┌───────────┼───────────────┐
                ▼           ▼               ▼
         Agregar        Nueva RFQ     Configuración
         proveedores        │          empresa
                            ▼
                     Tracking RFQ
                     (respuestas llegan)
                            │
                     ┌──────┴──────┐
                     ▼             ▼
               Formulario      Captura
               proveedor       manual
               (automático)
                     └──────┬──────┘
                            ▼
                       Comparador
                            │
                            ▼
                    Seleccionar ganador
                    + Cerrar RFQ
```

### Proveedor — Flujo completo (sin cuenta)

```
Recibe email
    │
    ▼
Click link  →  /respond/:token
    │
    ▼
Completa formulario
(precio por ítem, disponibilidad, plazo)
    │
    ▼
Envía cotización  →  /respond/:token/success
```

---

_Documento creado el 2026-06-03 — v1.1 (TRD + brand-brief + ui-spec)_
