# FLUJO DE USUARIO — CotizaMe

**Arquitectura:** Frontend (React/Next.js) separado del Backend (REST API)  
**Basado en:** `planing/init.md`  
**Ver también:** `planing/app-flow.md` (detalle pantallas/API), `planing/brand-brief.md`, `planing/ui-spec.md`, `planing/README.md`

---

## Actores del Sistema

| Actor            | Descripción                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| **Comprador**    | Empresa registrada que crea y gestiona solicitudes de cotización         |
| **Proveedor**    | Empresa/persona externa que responde cotizaciones (sin cuenta requerida) |
| _(futuro)_ Admin | Super-admin interno para gestión de la plataforma                        |

---

## 1. AUTENTICACIÓN

### 1.1 Registro de Empresa

```
Comprador → Landing Page → CTA "Empieza Gratis"
  └→ [SCREEN] /register
       Campos: nombre empresa, email, contraseña, país, industria
       └→ POST /api/auth/register
            Response: { user, company, token }
       └→ [SCREEN] /onboarding/plan  (selección de plan)
            └→ POST /api/billing/select-plan
       └→ [SCREEN] /onboarding/setup (nombre empresa, logo, zona horaria)
            └→ PATCH /api/companies/:id
       └→ Redirect → /dashboard
```

### 1.2 Login

```
Comprador → [SCREEN] /login
  └→ POST /api/auth/login
       Response: { token, user, company }
  └→ Redirect → /dashboard
```

### 1.3 Recuperar Contraseña

```
[SCREEN] /forgot-password
  └→ POST /api/auth/forgot-password  { email }
       Envía email con link

[SCREEN] /reset-password?token=xxx
  └→ POST /api/auth/reset-password  { token, newPassword }
```

---

## 2. DASHBOARD

```
Comprador → [SCREEN] /dashboard
  └→ GET /api/dashboard/summary
       Response: {
         activeRFQs: number,
         pendingResponses: number,
         suppliersCount: number,
         recentActivity: [...],
         monthlySavings: number
       }
```

**Componentes del dashboard:**

- KPI cards: cotizaciones activas, respuestas pendientes, total proveedores
- Lista de RFQs recientes con estado
- Actividad reciente (timeline)
- Botón principal: "Nueva Cotización"

---

## 3. GESTIÓN DE PROVEEDORES

### 3.1 Listar Proveedores

```
[SCREEN] /suppliers
  └→ GET /api/suppliers?page=&limit=&search=&category=
       Response: { data: [Supplier], total, page }
```

### 3.2 Agregar Proveedor

```
[SCREEN] /suppliers/new  (modal o página)
  Campos: nombre, email, teléfono, categorías, notas, contacto principal
  └→ POST /api/suppliers
       Body: { name, email, phone, whatsapp, categories[], notes, contactName }
       Response: { supplier }
```

### 3.3 Editar / Ver Proveedor

```
[SCREEN] /suppliers/:id
  └→ GET /api/suppliers/:id
       Muestra: info, historial de cotizaciones, estadísticas (precio promedio, tiempo respuesta)

  Editar inline:
  └→ PATCH /api/suppliers/:id

  Eliminar:
  └→ DELETE /api/suppliers/:id
```

### 3.4 Importar Proveedores (plan Professional+)

```
[SCREEN] /suppliers  → botón "Importar CSV"
  └→ POST /api/suppliers/import  (multipart/form-data)
       Response: { imported: number, errors: [...] }
```

---

## 4. SOLICITUD DE COTIZACIÓN (RFQ)

### 4.1 Crear Nueva Solicitud — Flujo Paso a Paso

```
Comprador → /dashboard → "Nueva Cotización"
```

**Paso 1 — Ítems** `[SCREEN] /rfq/new → step: items`

```
  Agregar productos/servicios a cotizar:
  - Nombre del ítem, cantidad, unidad, descripción, especificaciones

  No hay endpoint aquí (estado local/borrador)
  └→ POST /api/rfq (con status: "draft") al avanzar
       Body: { title, items: [{ name, qty, unit, description }] }
       Response: { rfq: { id, ...} }
```

**Paso 2 — Proveedores** `[SCREEN] /rfq/:id/edit → step: suppliers`

```
  Seleccionar proveedores de la lista existente o agregar uno nuevo en el momento
  └→ PATCH /api/rfq/:id
       Body: { supplierIds: [uuid, ...] }
```

**Paso 3 — Configuración** `[SCREEN] /rfq/:id/edit → step: config`

```
  - Fecha límite de respuesta
  - Mensaje personalizado (o usar plantilla)
  - Canal de envío: email, WhatsApp (según plan)
  - Moneda
  └→ PATCH /api/rfq/:id
       Body: { deadline, message, channel, currency }
```

**Paso 4 — Revisión y Envío** `[SCREEN] /rfq/:id/edit → step: review`

```
  Preview del mensaje que recibirá el proveedor
  └→ POST /api/rfq/:id/send
       Response: { rfq, sentCount, failedCount }
       (Backend envía emails/WhatsApp a cada proveedor con link único)
  └→ Redirect → /rfq/:id  (vista de detalle)
```

### 4.2 Ver Estado de Solicitud

```
[SCREEN] /rfq/:id
  └→ GET /api/rfq/:id
       Response: {
         rfq: { id, title, items, deadline, status },
         responses: [{ supplier, status, submittedAt, ... }]
       }

  Acciones disponibles:
  - Enviar recordatorio a proveedores que no han respondido
    └→ POST /api/rfq/:id/remind  { supplierIds?: [] }
  - Cerrar solicitud manualmente
    └→ PATCH /api/rfq/:id  { status: "closed" }
  - Agregar respuesta manual
    └→ Ver flujo 5.2
```

### 4.3 Listar Solicitudes

```
[SCREEN] /rfq
  └→ GET /api/rfq?status=&page=&search=
       Filtros: activas, cerradas, borrador, vencidas
       Response: { data: [RFQ], total }
```

---

## 5. CAPTURA DE RESPUESTAS

### 5.1 Respuesta del Proveedor (flujo externo — sin login)

```
Proveedor recibe email/WhatsApp con link:
https://app.cotizame.co/respond/:token

[SCREEN PUBLIC] /respond/:token
  └→ GET /api/respond/:token/validate
       Response: { rfq: { title, items, company }, supplier: { name } }
       (Valida token, verifica que no expiró)

  Proveedor completa formulario:
  - Para cada ítem: precio unitario, disponibilidad, tiempo entrega, notas
  - Puede adjuntar PDF con cotización formal

  └→ POST /api/respond/:token/submit
       Body: {
         items: [{ itemId, unitPrice, availability, leadTime, notes }],
         totalPrice, currency, validUntil, attachments[]
       }
       Response: { success: true }

  └→ [SCREEN PUBLIC] /respond/:token/success
       "Tu cotización fue recibida. Gracias."
```

### 5.2 Captura Manual (Comprador)

```
[SCREEN] /rfq/:id  → botón "Registrar respuesta manual"
  Modal con los mismos campos del formulario del proveedor

  └→ POST /api/rfq/:id/responses
       Body: { supplierId, items: [...], totalPrice, notes, source: "manual" }
```

### 5.3 Captura con IA — plan Business+ (futuro v3)

```
[SCREEN] /rfq/:id → "Subir PDF/imagen"
  └→ POST /api/rfq/:id/responses/ai-extract
       Body: multipart/form-data { supplierId, file }
       Response: { extracted: { items: [...], confidence } }
  → Comprador revisa y confirma
  └→ POST /api/rfq/:id/responses  { ...confirmedData }
```

---

## 6. COMPARADOR

```
[SCREEN] /rfq/:id/compare
  └→ GET /api/rfq/:id/compare
       Response: {
         items: [...],
         responses: [{
           supplier: { id, name },
           items: [{ itemId, unitPrice, leadTime }],
           totalPrice,
           rank: 1  // ordenado por precio total
         }],
         bestOverall: supplierId
       }

  Vistas disponibles:
  - Tabla comparativa (por ítem)
  - Vista resumen (total por proveedor + ranking)
  - Vista por menor precio por ítem

  Acciones:
  - Seleccionar ganador → PATCH /api/rfq/:id  { winnerId }
  - Exportar a Excel → GET /api/rfq/:id/export?format=xlsx
  - Exportar a PDF → GET /api/rfq/:id/export?format=pdf
```

---

## 7. HISTORIAL Y REPORTES

```
[SCREEN] /history
  └→ GET /api/rfq?status=closed&page=&from=&to=
       Historial de todas las cotizaciones cerradas con ganadores

[SCREEN] /reports  (plan Business+)
  └→ GET /api/reports/summary?from=&to=
       Response: {
         totalRFQs, avgResponseRate, avgSavings,
         topSuppliers: [...], categoryBreakdown: [...]
       }
  └→ GET /api/reports/suppliers/:id  (desempeño de proveedor)
```

---

## 8. CONFIGURACIÓN

### 8.1 Perfil de Empresa

```
[SCREEN] /settings/company
  └→ GET /api/companies/:id
  └→ PATCH /api/companies/:id  { name, logo, address, taxId, currency }
```

### 8.2 Usuarios / Equipo (plan Professional+)

```
[SCREEN] /settings/team
  └→ GET /api/companies/:id/members
  └→ POST /api/companies/:id/members/invite  { email, role }
  └→ DELETE /api/companies/:id/members/:userId
```

### 8.3 Plantillas de Mensajes

```
[SCREEN] /settings/templates
  └→ GET /api/templates
  └→ POST /api/templates  { name, subject, body, channel }
  └→ PATCH /api/templates/:id
  └→ DELETE /api/templates/:id
```

### 8.4 Plan y Facturación

```
[SCREEN] /settings/billing
  └→ GET /api/billing/subscription
       Response: { plan, status, nextBillingDate, usage: { suppliers, rfqs, users } }
  └→ POST /api/billing/upgrade  { planId }
  └→ GET /api/billing/invoices
```

---

## 9. NOTIFICACIONES

```
Estado global de notificaciones (header)
  └→ GET /api/notifications?unread=true
  └→ PATCH /api/notifications/:id/read
  └→ PATCH /api/notifications/read-all

Eventos que generan notificaciones:
  - Proveedor responde una cotización
  - Cotización próxima a vencer (24h antes)
  - Recordatorio enviado exitosamente
  - Nuevo usuario unido al equipo
```

---

## Catálogos canónicos (no duplicar aquí)

Para evitar deriva, los listados completos y versionados viven en sus dueños
únicos (ver `README.md` → *Fuente única de verdad*):

| Catálogo                          | Fuente canónica                          |
| --------------------------------- | ---------------------------------------- |
| Pantallas / rutas frontend        | `PRD.md` §9                              |
| Endpoints API (con prefijo `/api/v1`) | `PRD.md` §10 · contratos en `TRD.md` §5 |
| Alcance MVP por flujo             | `PRD.md` §6 (columna MVP) y §11          |
| Orden de construcción / tareas    | `implementation-plan.md`                 |

> Los diagramas de flujo de arriba son **de alto nivel** e ilustrativos; usan
> `/api/...` por brevedad. El prefijo real es **`/api/v1/...`**.
