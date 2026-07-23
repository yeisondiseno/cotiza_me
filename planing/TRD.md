# TRD — CotizaMe: Documento de Requisitos Técnicos

**Versión:** 1.1
**Fecha:** 2026-06-03
**Estado:** En revisión (sincronizado con `app-flow.md`)
**Referencia:** `planing/PRD.md`, `planing/user-flow.md`, `planing/app-flow.md`, `planing/brand-brief.md`, `planing/ui-spec.md`

---

## 1. Stack Tecnológico Confirmado

### Backend

| Componente      | Tecnología                                   | Versión  |
| --------------- | -------------------------------------------- | -------- |
| Lenguaje        | Python                                       | 3.12+    |
| Framework       | FastAPI                                      | ≥ 0.115  |
| Servidor ASGI   | Uvicorn (standard)                           | ≥ 0.32   |
| ORM             | SQLAlchemy (asyncio)                         | ≥ 2.0    |
| Driver DB       | asyncpg                                      | ≥ 0.30   |
| Migraciones     | Alembic                                      | ≥ 1.14   |
| Validación      | Pydantic v2 + pydantic-settings              | ≥ 2.10   |
| Autenticación   | python-jose[cryptography] (HS256)            | ≥ 3.3    |
| Hashing         | bcrypt                                       | ≥ 5.0    |
| Uploads         | python-multipart                             | ≥ 0.0.20 |
| Package manager | uv                                           | latest   |
| Testing         | pytest + pytest-asyncio + httpx + pytest-cov | ≥ 8.0    |
| Linter          | ruff                                         | latest   |

### Frontend

| Componente        | Tecnología                                       | Versión |
| ----------------- | ------------------------------------------------ | ------- |
| Framework         | Next.js (App Router)                             | 16.2.4  |
| Lenguaje          | TypeScript                                       | ^5      |
| Runtime UI        | React                                            | 19.2.4  |
| Estilos           | Tailwind CSS                                     | ^4      |
| i18n              | next-intl                                        | 4.12.0  |
| Formularios       | react-hook-form                                  | 7.76.0  |
| Iconos            | lucide-react + react-icons                       | latest  |
| Variantes CSS     | class-variance-authority + clsx + tailwind-merge | latest  |
| Optimizador       | million                                          | 3.1.11  |
| Sanitización HTML | sanitize-html                                    | 2.17.4  |
| Package manager   | bun                                              | latest  |
| Linter            | ESLint (eslint-config-next)                      | ^9      |

### Infraestructura

| Componente          | Tecnología                             | Fase |
| ------------------- | -------------------------------------- | ---- |
| Base de datos       | PostgreSQL                             | MVP  |
| Contenedor back     | Docker (Dockerfile incluido)           | MVP  |
| Email transaccional | Resend o SendGrid                      | MVP  |
| Cola de trabajos    | Celery + Redis                         | v2   |
| WhatsApp            | Twilio o 360dialog Business API        | v2   |
| Storage archivos    | S3-compatible (AWS S3 / Cloudflare R2) | v2   |
| IA extracción       | Claude API (claude-sonnet-4-6)         | v3   |

---

## 2. Arquitectura General

```
┌──────────────────────────────────────────────────┐
│                  CLIENTE (Browser)                │
│            Next.js 16 — App Router               │
│         /[locale]/(app)  /[locale]/(auth)        │
└───────────────────────┬──────────────────────────┘
                        │ HTTPS / REST JSON
                        ▼
┌──────────────────────────────────────────────────┐
│                FastAPI — /api/v1                  │
│         CORS: allowed_origins (settings)          │
│  ┌────────────────────────────────────────────┐  │
│  │  Módulos: auth | users | companies |       │  │
│  │  suppliers | rfq | responses | templates | │  │
│  │  billing | notifications                   │  │
│  └────────────┬───────────────────────────────┘  │
│               │ SQLAlchemy async                  │
└───────────────┼──────────────────────────────────┘
                ▼
┌──────────────────────────────────────────────────┐
│              PostgreSQL (asyncpg)                 │
│          pool_size=10, max_overflow=20            │
└──────────────────────────────────────────────────┘
```

**Comunicación:** El frontend consume exclusivamente el backend REST. No hay Server Actions de Next.js que toquen la base de datos directamente.

**Prefijo API:** Todos los endpoints usan `/api/v1/`.

---

## 3. Arquitectura del Backend

### 3.1 Patrón por Módulo: Clean Architecture (DDD ligero)

Cada módulo de negocio sigue esta estructura de carpetas:

```
app/modules/<módulo>/
├── __init__.py
├── domain/
│   ├── __init__.py
│   ├── entity.py        # Dataclass/Pydantic — entidad de dominio pura
│   └── port.py          # Interfaces (ABC) de repositorios
├── application/
│   ├── __init__.py
│   └── use_cases.py     # Casos de uso (clases con método .execute())
├── infrastructure/
│   ├── __init__.py
│   ├── model.py         # SQLAlchemy ORM model
│   └── repository.py    # Implementación concreta del puerto
└── presentation/
    ├── __init__.py
    ├── router.py         # FastAPI APIRouter
    ├── schemas.py        # Pydantic request/response schemas
    └── dependencies.py   # Depends() helpers (auth guard, etc.)
```

**Regla de dependencias:** `presentation → application → domain ← infrastructure`
La infraestructura implementa los puertos definidos en el dominio. Los casos de uso dependen de puertos, nunca de implementaciones concretas.

### 3.2 Módulos a Implementar

| Módulo          | Responsabilidad                                      | MVP |
| --------------- | ---------------------------------------------------- | --- |
| `auth`          | Registro, login, refresh, recuperación de contraseña | ✅  |
| `users`         | CRUD usuario, perfil, roles                          | ✅  |
| `companies`     | Empresa y configuración de tenant                    | ✅  |
| `suppliers`     | CRUD proveedores, importar CSV                       | ✅  |
| `rfq`           | Ciclo de vida de solicitudes de cotización           | ✅  |
| `responses`     | Captura de respuestas (manual, token, IA)            | ✅  |
| `templates`     | Plantillas de mensajes                               | —   |
| `notifications` | Bandeja de notificaciones en app                     | —   |
| `billing`       | Planes, suscripciones, facturas                      | —   |
| `reports`       | Agregados y analytics                                | —   |

### 3.3 Convenciones Backend

- **Todos los IDs:** UUID v4, columna `id` via `UUIDMixin`.
- **Soft delete:** Columna `deleted_at` (nullable). Los repositorios filtran `deleted_at IS NULL` en todas las queries por defecto.
- **Timestamps:** `created_at`, `updated_at` manejados por `TimestampMixin` con `server_default=func.now()`.
- **Multi-tenant:** Toda tabla de negocio tiene columna `company_id UUID NOT NULL` con FK a `companies.id`. Nunca se devuelven registros de otro tenant.
- **Paginación:** Parámetros `page: int = 1` y `limit: int = 20` (máx. 100) en todos los listados. Response: `{ data: [...], total: int, page: int, limit: int }`.
- **Error responses:** JSON `{ detail: str }` con status HTTP apropiado. Handlers centralizados en `app/core/exceptions.py`.
- **Async total:** Todos los endpoints y repositorios usan `async/await`. Prohibido bloquear el event loop.
- **Variables de entorno:** Cargadas exclusivamente via `pydantic-settings` desde `.env`. Nunca leer `os.environ` directamente en módulos de negocio.

### 3.4 Variables de Entorno — Backend

```env
# Obligatorias
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/cotizame
SECRET_KEY=<mínimo 32 chars aleatorios>

# Opcionales con defaults
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=development        # development | staging | production
ALLOWED_ORIGINS=["http://localhost:3000"]

# Email (v1 — requerido en producción)
EMAIL_PROVIDER=resend           # resend | sendgrid
EMAIL_API_KEY=
EMAIL_FROM=noreply@cotizame.co

# Storage (v2)
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_ENDPOINT_URL=               # Cloudflare R2 si aplica

# WhatsApp (v2)
WHATSAPP_PROVIDER=twilio        # twilio | 360dialog
WHATSAPP_ACCOUNT_SID=
WHATSAPP_AUTH_TOKEN=

# Redis / Celery (v2)
REDIS_URL=redis://localhost:6379/0

# IA (v3)
ANTHROPIC_API_KEY=
```

---

## 4. Esquema de Base de Datos

Convenciones globales:

- Todos los IDs: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- Timestamps: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- Soft delete: `deleted_at TIMESTAMPTZ`
- `company_id` en tablas de negocio: `UUID NOT NULL REFERENCES companies(id)`
- Snake_case para nombres de tabla y columna

### 4.1 `companies`

```sql
CREATE TABLE companies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(255) NOT NULL,
  logo_url     TEXT,
  tax_id       VARCHAR(50),                         -- NIT / RUT
  country      VARCHAR(2) NOT NULL DEFAULT 'CO',    -- ISO 3166-1 alpha-2
  currency     VARCHAR(3) NOT NULL DEFAULT 'COP',   -- ISO 4217
  timezone     VARCHAR(100) NOT NULL DEFAULT 'America/Bogota',
  industry     VARCHAR(100),
  plan_id         VARCHAR(50) NOT NULL DEFAULT 'starter',
  onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,   -- TRUE tras completar /onboarding/setup
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
```

### 4.2 `users`

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  email           VARCHAR(255) NOT NULL UNIQUE,
  full_name       VARCHAR(255) NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  role            VARCHAR(50) NOT NULL DEFAULT 'member',  -- owner | admin | member
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  invited_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
```

### 4.3 `password_reset_tokens`

```sql
CREATE TABLE password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  token      VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 4.4 `suppliers`

```sql
CREATE TABLE suppliers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES companies(id),
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255),
  phone        VARCHAR(50),
  whatsapp     VARCHAR(50),
  contact_name VARCHAR(255),
  categories   TEXT[] DEFAULT '{}',
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);
CREATE INDEX idx_suppliers_company_id ON suppliers(company_id);
```

### 4.5 `rfqs` (Request for Quotation)

```sql
CREATE TABLE rfqs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id),
  created_by  UUID NOT NULL REFERENCES users(id),
  title       VARCHAR(255) NOT NULL,
  deadline    TIMESTAMPTZ,
  message     TEXT,
  channel     VARCHAR(20) NOT NULL DEFAULT 'email',  -- email | whatsapp
  currency    VARCHAR(3) NOT NULL DEFAULT 'COP',
  status      VARCHAR(20) NOT NULL DEFAULT 'draft',  -- draft | sent | closed | expired
  winner_id           UUID REFERENCES suppliers(id), -- proveedor seleccionado
  winner_selected_by  UUID REFERENCES users(id),     -- quién eligió (auditoría)
  winner_selected_at  TIMESTAMPTZ,                    -- cuándo se eligió (auditoría)
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX idx_rfqs_company_id ON rfqs(company_id);
CREATE INDEX idx_rfqs_status ON rfqs(status);
```

### 4.6 `rfq_items`

```sql
CREATE TABLE rfq_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id         UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  name           VARCHAR(255) NOT NULL,
  quantity       NUMERIC(12,4) NOT NULL,
  unit           VARCHAR(50),                        -- unidad, kg, litro…
  description    TEXT,
  specifications TEXT,
  sort_order     SMALLINT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rfq_items_rfq_id ON rfq_items(rfq_id);
```

### 4.7 `rfq_suppliers` (relación RFQ ↔ Proveedor)

```sql
CREATE TABLE rfq_suppliers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id       UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id  UUID NOT NULL REFERENCES suppliers(id),
  token        VARCHAR(255) NOT NULL UNIQUE,           -- token público único
  token_used   BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at      TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | sent | responded | failed
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rfq_id, supplier_id)
);
CREATE INDEX idx_rfq_suppliers_rfq_id ON rfq_suppliers(rfq_id);
CREATE INDEX idx_rfq_suppliers_token ON rfq_suppliers(token);
```

### 4.8 `responses`

```sql
CREATE TABLE responses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id       UUID NOT NULL REFERENCES rfqs(id),
  supplier_id  UUID NOT NULL REFERENCES suppliers(id),
  total_price  NUMERIC(18,4),
  currency     VARCHAR(3) NOT NULL DEFAULT 'COP',
  valid_until  TIMESTAMPTZ,
  notes        TEXT,
  attachment_url TEXT,
  source       VARCHAR(20) NOT NULL DEFAULT 'form',  -- form | manual | ai
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rfq_id, supplier_id)
);
CREATE INDEX idx_responses_rfq_id ON responses(rfq_id);
```

### 4.9 `response_items`

```sql
CREATE TABLE response_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id  UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  rfq_item_id  UUID NOT NULL REFERENCES rfq_items(id),
  unit_price   NUMERIC(18,4),
  availability BOOLEAN,
  lead_time    VARCHAR(100),                          -- "3-5 días hábiles"
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_response_items_response_id ON response_items(response_id);
```

### 4.10 `templates`

```sql
CREATE TABLE templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name       VARCHAR(255) NOT NULL,
  subject    VARCHAR(500),                            -- para email
  body       TEXT NOT NULL,
  channel    VARCHAR(20) NOT NULL DEFAULT 'email',    -- email | whatsapp
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_templates_company_id ON templates(company_id);
```

### 4.11 `notifications`

```sql
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id    UUID REFERENCES users(id),
  type       VARCHAR(100) NOT NULL,                   -- response_received | rfq_expiring | etc.
  payload    JSONB NOT NULL DEFAULT '{}',
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
```

### 4.12 `subscriptions`

```sql
CREATE TABLE subscriptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) UNIQUE,
  plan_id          VARCHAR(50) NOT NULL DEFAULT 'starter',
  status           VARCHAR(20) NOT NULL DEFAULT 'active',  -- active | cancelled | past_due
  billing_cycle    VARCHAR(10) DEFAULT 'monthly',           -- monthly | semiannual | annual
  next_billing_at  TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 4.13 `invoices`

```sql
CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount          NUMERIC(18,2) NOT NULL,
  currency        VARCHAR(3) NOT NULL DEFAULT 'COP',
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | paid | failed
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
```

---

## 5. Contratos de API

### Convenciones globales

- **Content-Type:** `application/json` en todos los endpoints excepto uploads.
- **Autorización:** Header `Authorization: Bearer <access_token>` en rutas privadas.
- **Versión:** Prefijo `/api/v1/`.
- **Paginación respuesta:**
  ```json
  { "data": [...], "total": 120, "page": 2, "limit": 20 }
  ```
- **Errores:**
  ```json
  { "detail": "Mensaje de error legible" }
  ```

### 5.1 Auth — `/api/v1/auth`

#### `POST /register` — Registro de empresa + usuario owner

```json
// Request
{
  "full_name": "María López",
  "email": "maria@empresa.co",
  "password": "MinPassword1!",
  "company_name": "Empresa S.A.S.",
  "country": "CO",
  "industry": "construccion"
}

// Response 201
{
  "id": "uuid",
  "email": "maria@empresa.co",
  "full_name": "María López",
  "company_id": "uuid",
  "created_at": "2026-06-03T00:00:00Z"
}
```

#### `POST /login`

```json
// Request
{ "email": "maria@empresa.co", "password": "MinPassword1!" }

// Response 200
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

#### `POST /refresh`

```json
// Request
{ "refresh_token": "eyJ..." }
// Response 200 — igual a /login
```

#### `POST /forgot-password`

```json
// Request
{ "email": "maria@empresa.co" }
// Response 200
{ "detail": "Si el email existe, recibirás un enlace." }
```

#### `POST /reset-password`

```json
// Request
{ "token": "uuid-token", "new_password": "NuevoPassword1!" }
// Response 200
{ "detail": "Contraseña actualizada correctamente." }
```

#### `GET /me` — Requiere auth

```json
// Response 200 — usado por (app)/layout.tsx para SessionContext
{
  "id": "uuid",
  "email": "maria@empresa.co",
  "full_name": "María López",
  "role": "owner",
  "company": {
    "id": "uuid",
    "name": "Empresa S.A.S.",
    "plan_id": "starter",
    "currency": "COP",
    "timezone": "America/Bogota",
    "onboarding_done": false
  }
}
```

---

### 5.2 Companies — `/api/v1/companies`

#### `GET /:id`

```json
{
  "id": "uuid",
  "name": "Empresa S.A.S.",
  "logo_url": null,
  "country": "CO",
  "currency": "COP",
  "timezone": "America/Bogota",
  "industry": "construccion",
  "plan_id": "starter",
  "onboarding_done": false
}
```

#### `PATCH /:id`

```json
// Request (todos los campos opcionales)
{
  "name": "Empresa SAS",
  "currency": "USD",
  "logo_url": "https://...",
  "onboarding_done": true
}
```

#### `GET /:id/members`

```json
{
  "data": [
    {
      "id": "uuid",
      "full_name": "...",
      "email": "...",
      "role": "owner",
      "is_active": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

#### `POST /:id/members/invite`

```json
// Request
{ "email": "nuevo@empresa.co", "role": "member" }
// Response 201
{ "id": "uuid", "email": "nuevo@empresa.co", "role": "member", "invited_at": "..." }
```

#### `DELETE /:id/members/:userId` → `204 No Content`

---

### 5.3 Suppliers — `/api/v1/suppliers`

#### `GET /` — `?page=1&limit=20&search=&category=`

#### `POST /`

```json
// Request
{
  "name": "Proveedor XYZ",
  "email": "ventas@xyz.co",
  "phone": "3001234567",
  "whatsapp": "573001234567",
  "contact_name": "Carlos Ruiz",
  "categories": ["papelería", "tecnología"],
  "notes": "Pago a 30 días"
}
// Response 201 — objeto Supplier completo
```

#### `GET /:id`, `PATCH /:id`, `DELETE /:id` (soft delete)

#### `POST /import` — `multipart/form-data` (Professional+)

```json
// Response 200
{ "imported": 42, "errors": [{ "row": 5, "reason": "Email inválido" }] }
```

---

### 5.4 RFQ — `/api/v1/rfq`

#### `GET /` — `?page=1&limit=20&status=&search=`

```json
// Response 200 — paginada
{
  "data": [
    {
      "id": "uuid",
      "title": "Compra papelería Q3",
      "status": "sent",
      "deadline": "2026-06-15T23:59:59Z",
      "responses_count": 2,
      "suppliers_count": 3,
      "sent_at": "2026-06-03T10:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

#### `GET /:id` — Detalle + estado de respuestas por proveedor

```json
// Response 200
{
  "rfq": { "id": "uuid", "title": "...", "items": [...], "deadline": "...", "status": "sent", "channel": "email", "currency": "COP" },
  "supplier_responses": [
    { "supplier": { "id": "uuid", "name": "..." }, "status": "pending", "responded_at": null }
  ]
}
```

#### `POST /` — Crear borrador

```json
// Request
{
  "title": "Compra papelería Q3",
  "items": [
    {
      "name": "Resma papel carta",
      "quantity": 10,
      "unit": "resma",
      "description": "75g",
      "sort_order": 0
    }
  ]
}
// Response 201 — { "id": "uuid", "status": "draft", ... }
```

#### `PATCH /:id` — Actualización progresiva

```json
// Paso 2: proveedores
{ "supplier_ids": ["uuid1", "uuid2"] }

// Paso 3: configuración
{ "deadline": "2026-06-15T23:59:59Z", "message": "...", "channel": "email", "currency": "COP" }

// Cierre manual
{ "status": "closed" }

// Seleccionar ganador
{ "winner_id": "supplier-uuid" }
```

#### `POST /:id/send`

```json
// Response 200
{ "rfq_id": "uuid", "sent_count": 3, "failed_count": 0, "failures": [] }
```

#### `POST /:id/remind`

```json
// Request (vacío = todos los pendientes)
{ "supplier_ids": ["uuid1"] }
// Response 200
{ "reminded_count": 1 }
```

#### `GET /:id/compare`

```json
{
  "rfq_id": "uuid",
  "items": [{ "id": "uuid", "name": "Resma papel carta", "quantity": 10 }],
  "responses": [
    {
      "supplier": { "id": "uuid", "name": "Proveedor XYZ" },
      "total_price": 180000,
      "currency": "COP",
      "items": [
        {
          "rfq_item_id": "uuid",
          "unit_price": 18000,
          "lead_time": "3 días",
          "availability": true
        }
      ],
      "rank": 1
    }
  ],
  "best_overall_supplier_id": "uuid"
}
```

#### `GET /:id/export` — `?format=xlsx|pdf` → archivo binario

---

### 5.5 Responses — `/api/v1/rfq/:rfqId/responses`

#### `POST /` — Captura manual

```json
// Request
{
  "supplier_id": "uuid",
  "items": [
    {
      "rfq_item_id": "uuid",
      "unit_price": 18000,
      "lead_time": "3 días",
      "availability": true
    }
  ],
  "total_price": 180000,
  "currency": "COP",
  "notes": "Incluye IVA",
  "source": "manual"
}
```

#### `POST /ai-extract` — IA (Business+) — `multipart/form-data`

```json
// Response 200
{
  "extracted": {
    "items": [{ "rfq_item_id": "uuid", "unit_price": 18000 }],
    "total_price": 180000,
    "confidence": 0.92
  }
}
// Requiere confirmación del comprador antes de guardar
```

---

### 5.6 Respond (público) — `/api/v1/respond`

#### `GET /:token/validate`

```json
// Response 200
{
  "rfq": { "title": "Compra papelería Q3", "items": [...], "deadline": "...", "company_name": "Empresa S.A.S." },
  "supplier": { "name": "Proveedor XYZ" }
}
// Response 404 — token inválido
// Response 410 — token expirado o ya respondido
```

#### `POST /:token/submit`

```json
// Request
{
  "items": [{ "rfq_item_id": "uuid", "unit_price": 18000, "availability": true, "lead_time": "3 días", "notes": "" }],
  "total_price": 180000,
  "currency": "COP",
  "valid_until": "2026-06-30T00:00:00Z",
  "notes": "Precios incluyen IVA"
}
// Response 200
{ "success": true }
```

---

### 5.7 Dashboard — `/api/v1/dashboard`

#### `GET /summary`

```json
{
  "active_rfqs": 5,
  "pending_responses": 12,
  "suppliers_count": 8,
  "recent_rfqs": [
    {
      "id": "uuid",
      "title": "...",
      "status": "sent",
      "responses": 2,
      "total_suppliers": 3
    }
  ],
  "monthly_savings": null,
  "recent_activity": []
}
```

**MVP:** `recent_rfqs` es obligatorio. `monthly_savings` y `recent_activity` pueden ser `null` / `[]`; el frontend no muestra esos bloques hasta V2.

---

### 5.8 Reports — `/api/v1/reports` (Business+)

#### `GET /summary?from=&to=`

```json
{
  "total_rfqs": 48,
  "avg_response_rate": 0.72,
  "avg_savings_pct": 0.15,
  "top_suppliers": [
    { "id": "uuid", "name": "XYZ", "responses": 20, "avg_price_delta": -0.08 }
  ],
  "category_breakdown": [
    { "category": "papelería", "rfq_count": 15, "avg_responses": 2.8 }
  ]
}
```

---

## 6. Arquitectura del Frontend

### 6.1 Estructura de Carpetas

```
front/src/
├── app/
│   ├── layout.tsx                    # Root layout (providers globales)
│   ├── globals.css
│   ├── [locale]/                     # i18n wrapper (next-intl)
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Landing page (/)
│   │   ├── (auth)/                   # Rutas públicas de autenticación
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (app)/                    # Rutas privadas (requieren auth)
│   │   │   ├── layout.tsx            # Shell con sidebar + header
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── rfq/
│   │   │   │   ├── page.tsx          # Lista
│   │   │   │   ├── new/page.tsx      # Wizard paso 1 (ítems)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Detalle + respuestas
│   │   │   │       ├── edit/page.tsx # Wizard pasos 2–4 (?step=suppliers|config|review)
│   │   │   │       └── compare/page.tsx
│   │   │   ├── suppliers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── history/page.tsx      # V2 — oculto en sidebar MVP
│   │   │   ├── reports/page.tsx      # V3 — oculto en sidebar MVP
│   │   │   ├── settings/
│   │   │   │   ├── company/page.tsx
│   │   │   │   ├── team/page.tsx
│   │   │   │   ├── templates/page.tsx
│   │   │   │   └── billing/page.tsx
│   │   │   └── onboarding/
│   │   │       ├── plan/page.tsx
│   │   │       └── setup/page.tsx
│   │   └── respond/
│   │       ├── error/page.tsx        # ?reason=invalid|expired|already_submitted
│   │       └── [token]/
│   │           ├── page.tsx          # Formulario público proveedor
│   │           └── success/page.tsx
├── components/
│   ├── atoms/                        # button, input, label, badge, spinner, avatar
│   ├── molecules/                    # card, form-field, modal, dropdown, toast, data-table
│   ├── organisms/                    # sidebar, header, rfq-wizard, compare-table, supplier-form
│   └── templates/                    # layouts reutilizables (auth-layout, app-shell)
├── hooks/                            # Custom hooks (useAuth, useSuppliers, useRFQ…)
├── services/
│   ├── fetchers/                     # Funciones fetch tipadas por recurso
│   └── actions/                      # Server Actions (si aplica en Next.js 16)
├── constants/                        # PLAN_LIMITS, ROUTES, nav-config.ts, STATUS_LABELS
├── types/                            # DTOs e interfaces TypeScript
├── utils/                            # formatCurrency, formatDate, cn(), etc.
├── i18n/
│   ├── routing.ts                    # defineRouting (es | en, default: es)
│   └── request.ts
├── lib/
│   └── utils.ts                      # cn() (clsx + tailwind-merge)
└── proxy.ts                          # Re-exporta URL base de la API
```

### 6.2 Convenciones de Código Frontend

Ver `.claude/rules/code-patterns.md` para las reglas completas. Resumen:

- **Solo arrow functions.** Nunca `function` declarations (excepto `generateMetadata` / `generateStaticParams`).
- **Imports agrupados** con comentarios: `// React`, `// Next`, `// Libraries`, `// Hooks`, `// Components`, `// Icons`, `// Utils`, `// Constants`, `// Services`, `// Types`, `// Styles`.
- **Orden en el body del componente:** Props → Params → Queries → State → Hooks → Values → Actions → useEffect → return.
- **Mapping objects** en vez de `switch`.
- **`useMemo`** para JSX almacenado en variable.
- **`useEffect` solo** para sincronización con sistemas externos (WebSockets, timers). Nunca para derivar estado.
- **Longitud máxima:** 250 líneas por archivo. >250 → split obligatorio.

### 6.3 Gestión de Estado y Data Fetching

| Caso                            | Solución                                               |
| ------------------------------- | ------------------------------------------------------ |
| Datos remotos (listas, detalle) | `fetch` nativo de Next.js o SWR/React Query (a añadir) |
| Estado de formularios           | `react-hook-form`                                      |
| Estado global de sesión         | Context ligero o Zustand (a definir)                   |
| Valores derivados costosos      | `useMemo`                                              |
| Efectos secundarios             | `useEffect` solo para externos                         |

### 6.4 Autenticación Frontend

- Los tokens se almacenan en **httpOnly cookies** (manejadas por el backend vía `Set-Cookie`).
- El middleware de Next.js (`middleware.ts`):
  1. Rutas `(app)` sin cookie válida → redirect `/[locale]/login`.
  2. Rutas `(auth)` con sesión válida → redirect `/[locale]/dashboard`.
  3. Rutas `(app)` con sesión pero `company.onboarding_done === false` (desde `/me` o claim en cookie) → redirect `/[locale]/onboarding/setup` (excepto `/onboarding/*`).
  4. Rutas `respond/*` → siempre continúan (validación por token en API).
- **Refresh token (MVP):** JWT stateless; si `POST /auth/refresh` falla o el access token expiró, redirect a login sin reintento infinito. Lista negra de refresh en Redis → v2.
- Tras login/registro exitoso: cargar sesión vía `GET /me` antes de renderizar el shell.

### 6.5 Internacionalización

- `next-intl` con locales `['es', 'en']`, default `'es'`.
- Todas las cadenas de UI en `front/messages/es.json` y `front/messages/en.json`.
- Nunca strings hardcodeados en componentes — usar `useTranslations()`.
- Formato de moneda: `Intl.NumberFormat` con locale y currency de la empresa del usuario.
- Formato de fechas: `Intl.DateTimeFormat` con timezone de la empresa.
- **Voz y léxico:** `planing/brand-brief.md` §4 (tú / you, términos RFQ).
- **Diseño visual por pantalla:** `planing/ui-spec.md`; tokens en `planing/color-tokens.json`, `planing/type-tokens.json` (runtime: `globals.css`).

### 6.6 Alias de Importación

Configurado en `tsconfig.json`:

```json
{
  "@/*": ["./src/*"]
}
```

Usar siempre alias absolutos: `@/components/atoms/button` en vez de `../../../components/atoms/button`.

### 6.7 Variables de Entorno — Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. Seguridad

### 7.1 Autenticación JWT

| Token   | Algoritmo | Duración              | Claims                                    |
| ------- | --------- | --------------------- | ----------------------------------------- |
| Access  | HS256     | 30 min (configurable) | `sub` (user_id), `exp`, `type: "access"`  |
| Refresh | HS256     | 7 días (configurable) | `sub` (user_id), `exp`, `type: "refresh"` |

- El `secret_key` debe ser mínimo 32 caracteres aleatorios. Rotar en producción.
- Los tokens de refresco deben invalidarse al hacer logout (lista negra en Redis — v2, en MVP son stateless).

### 7.2 Tokens de Respuesta Pública

- UUID v4 generado al crear `rfq_suppliers`.
- Válido hasta `rfq.deadline + 24h buffer`.
- Uso único: `token_used = TRUE` al recibir respuesta exitosa.
- No requieren autenticación pero sí validación de expiración y uso.

### 7.3 Hashing de Contraseñas

- `bcrypt` con `gensalt()` (rounds predeterminados del sistema, ≥ 12).
- Nunca almacenar contraseñas en texto plano ni en logs.

### 7.4 Validación de Entradas

- Toda entrada pasa por schemas Pydantic v2 en el backend.
- El frontend usa `react-hook-form` con validación + `sanitize-html` para campos de texto libre.
- Parámetros de path (`:id`, `:token`) validados como UUID / string antes de consultar la BD.

### 7.5 Multi-Tenant Isolation

- Todo query de negocio incluye `WHERE company_id = :current_company_id`.
- El `company_id` se extrae del JWT, nunca del request body.
- Los endpoints `GET /api/v1/respond/:token` son la única excepción (sin auth, identificación por token).

### 7.6 CORS

- `allowed_origins` configurado en settings. En producción: solo dominio del frontend.
- `allow_credentials=True` para cookies.

### 7.7 Rate Limiting (a implementar en v1 antes de producción)

| Endpoint                      | Límite              |
| ----------------------------- | ------------------- |
| `POST /auth/login`            | 10 req/min por IP   |
| `POST /auth/register`         | 5 req/min por IP    |
| `POST /auth/forgot-password`  | 3 req/min por IP    |
| `POST /respond/:token/submit` | 5 req/min por token |

---

## 8. Envío de Emails (MVP)

### 8.1 Eventos que disparan emails

| Evento               | Destinatario             | Template                             |
| -------------------- | ------------------------ | ------------------------------------ |
| Registro exitoso     | Comprador                | Bienvenida + link onboarding         |
| RFQ enviada          | Proveedor (por cada uno) | Solicitud de cotización + link único |
| Respuesta recibida   | Comprador                | Notificación de respuesta            |
| Recordatorio         | Proveedor sin respuesta  | Recordatorio amable                  |
| Recuperar contraseña | Comprador                | Link reset (expira en 1h)            |

### 8.2 Diseño del link de cotización

```
https://app.cotizame.co/respond/<token>
```

El token es `rfq_suppliers.token` (`secrets.token_urlsafe(32)`, ~43 caracteres URL-safe — ver §11.4).

### 8.3 Implementación asíncrona

En MVP: envío directo en el handler (síncrono pero non-blocking via `asyncio`).
En v2: mover a worker Celery para no bloquear el response de la API.

---

## 9. Migraciones de Base de Datos

- Herramienta: **Alembic** con autogenerate.
- Las migraciones viven en `back/migrations/versions/`.
- **Regla:** nunca modificar una migración ya aplicada en producción. Crear una nueva.
- Convención de nombre: `<timestamp>_<descripción_corta>.py`.
- **Soft delete:** nunca usar `DROP COLUMN` ni `DROP TABLE`. Marcar `deleted_at` y filtrar en queries.
- Ejecutar `alembic upgrade head` en el arranque del contenedor (en entorno de staging/prod via CI).

---

## 10. Estrategia de Testing

### Backend

| Nivel                   | Herramienta               | Cobertura objetivo          |
| ----------------------- | ------------------------- | --------------------------- |
| Unit (casos de uso)     | pytest + pytest-asyncio   | 80% de use cases            |
| Integración (endpoints) | httpx + TestClient        | Todos los endpoints del MVP |
| Contrato API            | pytest + schemas Pydantic | Request/response shape      |

Convenciones:

- Tests en `back/tests/` con estructura espejo: `tests/modules/auth/`, `tests/modules/rfq/`, etc.
- Base de datos de test: PostgreSQL en Docker (misma imagen, BD separada `cotizame_test`).
- Fixtures async para crear datos de prueba (empresa, usuario, proveedor).
- Nunca mockear la base de datos — usar una BD de test real.

### Frontend

| Nivel               | Herramienta              | Cobertura objetivo                                    |
| ------------------- | ------------------------ | ----------------------------------------------------- |
| Unit (utils, hooks) | Vitest                   | Funciones puras y hooks                               |
| Componentes         | Testing Library + Vitest | Componentes críticos (formularios)                    |
| E2E (flujos MVP)    | Playwright               | Flujo completo: registro → RFQ → respuesta → comparar |

---

## 11. Lógica de Negocio Crítica

### 11.1 Límites de Plan

Los límites se evalúan en el backend antes de cada operación de creación:

```python
PLAN_LIMITS = {
    "starter":      { "suppliers": 3,   "rfqs_per_month": 5,   "users": 1  },
    "professional": { "suppliers": 15,  "rfqs_per_month": 50,  "users": 3  },
    "business":     { "suppliers": 50,  "rfqs_per_month": None, "users": 10 },
    "enterprise":   { "suppliers": None,"rfqs_per_month": None, "users": None },
}
```

Si el límite se supera → `HTTP 402 Payment Required` con `{ "detail": "Límite de plan alcanzado", "upgrade_required": true }`.

### 11.2 Estados de RFQ

```
draft → sent → closed
              ↑
         (auto) expired  ←  job que corre diariamente evaluando deadline
```

Transiciones válidas:

- `draft → sent`: solo via `POST /rfq/:id/send`
- `sent → closed`: manual via `PATCH /rfq/:id { status: "closed" }` o automático al seleccionar ganador
- `sent → expired`: job nocturno si `deadline < now()` y status es `sent`

### 11.3 Algoritmo del Comparador

Ranking por **precio total** ascendente. Si el proveedor no cotizó algún ítem, su `total_price` se marca como `null` y queda al final del ranking.

Vista "menor precio por ítem": para cada ítem, resaltar el `response_items` con menor `unit_price`.

### 11.4 Generación de Token de Proveedor

```python
import secrets
token = secrets.token_urlsafe(32)  # ~43 chars, criptográficamente seguro
```

Almacenado en `rfq_suppliers.token`. Único por constraint de BD.

---

## 12. Convenciones de Git y CI

### Ramas

| Rama             | Uso                                      |
| ---------------- | ---------------------------------------- |
| `main`           | Producción — solo merges via PR aprobado |
| `develop`        | Integración continua                     |
| `feat/<nombre>`  | Features nuevas                          |
| `fix/<nombre>`   | Bug fixes                                |
| `chore/<nombre>` | Configuración, deps, docs                |

### Commits

Formato [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(rfq): add supplier selection step in wizard
fix(auth): handle expired refresh token correctly
chore(deps): upgrade fastapi to 0.115.5
```

### CI (a implementar)

1. `ruff check` y `ruff format --check` — backend
2. `pytest --cov=app --cov-fail-under=80` — backend
3. `tsc --noEmit` — frontend
4. `eslint` — frontend
5. Build de producción (`bun run build`) — frontend

---

## 13. Docker y Despliegue

### Backend `back/Dockerfile` (existente)

Imagen base: `python:3.12-slim`. Usa `uv` para instalar dependencias.

### Compose local (a crear: `docker-compose.yml` en raíz)

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: cotizame
      POSTGRES_USER: cotizame
      POSTGRES_PASSWORD: cotizame
    ports: ["5432:5432"]

  back:
    build: ./back
    env_file: ./back/.env
    ports: ["8000:8000"]
    depends_on: [db]

  front:
    # Desarrollo con bun dev
    ports: ["3000:3000"]
```

---

## 14. Decisiones de Diseño Técnico

| Decisión         | Elección                          | Alternativa descartada       | Razón                                             |
| ---------------- | --------------------------------- | ---------------------------- | ------------------------------------------------- |
| ORM async        | SQLAlchemy 2 async                | Tortoise ORM                 | Mayor madurez, migración sin fricción con Alembic |
| Auth tokens      | JWT stateless                     | Sesiones en BD               | Escala horizontalmente sin Redis en MVP           |
| Soft delete      | `deleted_at` column               | Hard delete                  | Auditoría y recuperación de datos                 |
| Multi-tenant     | `company_id` en cada tabla        | Schemas separados por tenant | Simplicidad operacional                           |
| Frontend routing | Next.js App Router con `[locale]` | Pages Router                 | next-intl v4 requiere App Router                  |
| Formularios      | react-hook-form                   | Controlled components        | Performance en formularios complejos (RFQ wizard) |
| Estilos          | Tailwind v4                       | CSS Modules                  | Consistencia con la base de código existente      |

---

_Documento creado el 2026-06-03_
