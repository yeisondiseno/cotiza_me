# PRD — CotizaMe: Plataforma de Cotizaciones Automatizadas B2B

**Versión:** 1.1
**Fecha:** 2026-06-03
**Estado:** Aprobado para ejecución MVP
**Fuentes:** `planing/init.md`, `planing/user-flow.md`, `planing/brand-brief.md`, `planing/ui-spec.md`, `planing/app-flow.md`, `planing/TRD.md`

---

## 1. Resumen Ejecutivo

CotizaMe es una plataforma SaaS B2B que automatiza el proceso de solicitud y comparación de cotizaciones. Elimina las horas perdidas en contacto manual con proveedores, consolidación en Excel y comparación desordenada de precios, reemplazándolas con un flujo centralizado de envío, recepción y análisis de cotizaciones.

**Diferenciador estratégico (V2+):** Integración nativa con WhatsApp Business API — el canal dominante de comunicación B2B en Latinoamérica.

**Diferenciador MVP (meses 1–3):** Ciclo completo email-only con proveedor sin cuenta, comparador inmediato y onboarding en español en menos de 10 minutos. WhatsApp se valida en V2; el MVP demuestra valor con email antes de invertir en integraciones de canal.

---

## 2. Problema

Las empresas en Colombia y LATAM pierden entre 4 y 8 horas semanales por persona gestionando cotizaciones manualmente:

- Contacto disperso con proveedores (email, WhatsApp, teléfono)
- Consolidación manual en hojas de cálculo
- Sin historial ni trazabilidad de negociaciones
- Errores humanos en transcripción y comparación de precios
- Decisiones de compra subóptimas por falta de visibilidad

---

## 3. Objetivos del Producto

### North star (producto)

**Solicitudes de cotización completadas con comparación usable** — una RFQ donde el comprador recibió ≥2 respuestas comparables y registró la decisión de proveedor ganador.

### Objetivos por fase

| #   | Objetivo                                  | Métrica de éxito                                             | Fase                    |
| --- | ----------------------------------------- | ------------------------------------------------------------ | ----------------------- |
| O1  | Reducir tiempo de gestión de cotizaciones | ≥2 h/semana ahorradas vs proceso manual (autoreporte piloto) | MVP (mes 3)             |
| O2  | Aumentar tasa de respuesta de proveedores | ≥40% en pilotos email; meta 55% post-WhatsApp (V2)           | MVP / V2                |
| O3  | Validar product-market fit en Colombia    | 5–10 empresas piloto activas; ≥3 RFQs completadas/piloto/mes | MVP (mes 3)             |
| O4  | Alcanzar MRR conservador                  | $12,4 millones COP/mes (~$3.000 USD)                         | Año 1 (post-validación) |
| O5  | Retención de clientes                     | Churn mensual < 5%                                           | SaaS (mes 6+)           |

> Las métricas O4 y O5 no aplican durante la fase piloto gratuita. O1 aspiracional a largo plazo (<1 h/semana) se mide después de V2.

---

## 4. Actores del Sistema

| Actor                | Descripción                                                            | Requiere cuenta            |
| -------------------- | ---------------------------------------------------------------------- | -------------------------- |
| **Comprador**        | Empresa registrada que crea y gestiona solicitudes de cotización (RFQ) | Sí                         |
| **Proveedor**        | Empresa o persona externa que recibe y responde cotizaciones           | No (token de acceso único) |
| **Admin** _(futuro)_ | Super-admin interno para gestión de la plataforma                      | Sí                         |

---

## 5. Planes y Límites

| Plan                   | Precio COP | Precio USD | Proveedores | RFQs/mes   | Usuarios   | Canales                  |
| ---------------------- | ---------- | ---------- | ----------- | ---------- | ---------- | ------------------------ |
| **Starter** (Gratuito) | $0         | $0         | ≤ 3         | ≤ 5        | 1          | Email                    |
| **Professional**       | $149.000   | $35        | ≤ 15        | ≤ 50       | 3          | Email + WhatsApp         |
| **Business**           | $349.000   | $85        | ≤ 50        | Ilimitadas | 10         | Email + WhatsApp + IA    |
| **Enterprise**         | $899.000+  | $220+      | Ilimitados  | Ilimitadas | Ilimitados | Todo + ERP + white label |

**Descuentos:** 20% anual (2 meses gratis), 10% semestral.

**Piloto MVP:** Todas las empresas piloto operan en plan Starter fijo. Selección de plan y cobro real se habilitan en V2.

**Enforcement de límites:** Validación obligatoria en backend (API retorna 403/422 al superar límites). La UI muestra bloqueo como refuerzo, no como única barrera.

---

## 6. Requisitos Funcionales

> **Convención columna MVP:** ✅ = incluido en MVP piloto (meses 1–3). V2 / V3 = fase posterior. La columna MVP está alineada con §14 (criterios de aceptación).

### 6.1 Autenticación y Onboarding

| ID        | Requisito                                                                                                               | Plan  | MVP |
| --------- | ----------------------------------------------------------------------------------------------------------------------- | ----- | --- |
| F-AUTH-01 | Registro de empresa con: nombre, email, contraseña, país, industria                                                     | Todos | ✅  |
| F-AUTH-02 | Login con email y contraseña, retorna JWT                                                                               | Todos | ✅  |
| F-AUTH-03 | Recuperación de contraseña por email con token de expiración                                                            | Todos | ✅  |
| F-AUTH-04 | Onboarding post-registro: setup mínimo de empresa (nombre, moneda, zona horaria). Plan Starter asignado automáticamente | Todos | ✅  |
| F-AUTH-05 | Logout: eliminación de token en cliente. Revocación server-side (blacklist) diferida a V2                               | Todos | ✅  |
| F-AUTH-06 | Selección de plan y upgrade de suscripción                                                                              | Todos | V2  |

### 6.2 Gestión de Proveedores

| ID       | Requisito                                                                                            | Plan          | MVP |
| -------- | ---------------------------------------------------------------------------------------------------- | ------------- | --- |
| F-SUP-01 | CRUD de proveedores: nombre, email, teléfono (WhatsApp opcional como dato), categorías, notas        | Todos         | ✅  |
| F-SUP-02 | Búsqueda por nombre con paginación básica                                                            | Todos         | ✅  |
| F-SUP-03 | Vista de detalle con historial de cotizaciones y estadísticas (precio promedio, tiempo de respuesta) | Todos         | V2  |
| F-SUP-04 | Importación masiva desde CSV                                                                         | Professional+ | V2  |
| F-SUP-05 | Límite de proveedores según plan: bloqueo en UI + validación server-side                             | Todos         | ✅  |

### 6.3 Solicitud de Cotización (RFQ)

| ID       | Requisito                                                                                      | Plan          | MVP |
| -------- | ---------------------------------------------------------------------------------------------- | ------------- | --- |
| F-RFQ-01 | Creación de RFQ en formulario único o wizard simplificado (ítems, proveedores, mensaje, envío) | Todos         | ✅  |
| F-RFQ-02 | Definición de ítems: nombre, cantidad, unidad, descripción                                     | Todos         | ✅  |
| F-RFQ-03 | Selección de proveedores de la lista existente o creación inline de uno nuevo                  | Todos         | ✅  |
| F-RFQ-04 | Configuración: fecha límite, mensaje personalizado, moneda. Canal fijo `email` en MVP          | Todos         | ✅  |
| F-RFQ-05 | Preview del mensaje antes del envío                                                            | Todos         | V2  |
| F-RFQ-06 | Envío por email con link único por proveedor                                                   | Todos         | ✅  |
| F-RFQ-07 | Envío por WhatsApp Business API                                                                | Professional+ | V2  |
| F-RFQ-08 | Guardado como borrador (`draft`)                                                               | Todos         | ✅  |
| F-RFQ-09 | Estados de RFQ: `draft`, `sent`, `closed`, `expired`                                           | Todos         | ✅  |
| F-RFQ-10 | Cierre manual de solicitud por el comprador                                                    | Todos         | ✅  |
| F-RFQ-11 | Listado con filtro por estado y paginación                                                     | Todos         | ✅  |
| F-RFQ-12 | Envío de recordatorio manual a proveedores sin respuesta                                       | Todos         | V2  |
| F-RFQ-13 | Recordatorios automáticos a proveedores (configurable)                                         | Business+     | V2  |

### 6.4 Respuesta del Proveedor

| ID       | Requisito                                                                                                          | Plan      | MVP |
| -------- | ------------------------------------------------------------------------------------------------------------------ | --------- | --- |
| F-RES-01 | Formulario público vía token único (sin login): precio unitario, disponibilidad, tiempo de entrega, notas por ítem | Todos     | ✅  |
| F-RES-02 | Adjuntar PDF de cotización formal en formulario público                                                            | Todos     | V2  |
| F-RES-03 | Validación de token (expiración, ya enviado)                                                                       | Todos     | ✅  |
| F-RES-04 | Pantalla de confirmación post-envío para el proveedor                                                              | Todos     | ✅  |
| F-RES-05 | Captura manual por el comprador desde la vista de detalle de RFQ                                                   | Todos     | ✅  |
| F-RES-06 | Extracción automática de precios desde PDF/imagen con IA (con revisión humana)                                     | Business+ | V3  |

### 6.5 Comparador de Cotizaciones

| ID       | Requisito                                                                        | Plan          | MVP |
| -------- | -------------------------------------------------------------------------------- | ------------- | --- |
| F-CMP-01 | Tabla comparativa por ítem con ranking automático por precio total del proveedor | Todos         | ✅  |
| F-CMP-02 | Vista resumen: total por proveedor + ranking                                     | Todos         | ✅  |
| F-CMP-03 | Vista por menor precio por ítem (mix óptimo)                                     | Todos         | V2  |
| F-CMP-04 | Selección de proveedor ganador por RFQ con registro en el sistema                | Todos         | ✅  |
| F-CMP-05 | Exportar comparador a Excel (.xlsx)                                              | Professional+ | V2  |
| F-CMP-06 | Exportar comparador a PDF                                                        | Professional+ | V2  |

#### Reglas del comparador (MVP)

| Caso                                      | Comportamiento                                                                                |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| Respuesta parcial (proveedor omite ítems) | Ítems sin precio se marcan como "sin cotizar"; no entran en total del proveedor               |
| Unidades distintas entre proveedores      | RFQ define unidad canónica; proveedor cotiza en esa unidad (sin conversión automática en MVP) |
| Moneda distinta a la RFQ                  | Respuesta rechazada con mensaje de error; moneda fijada por RFQ en MVP                        |
| Empate de precio total                    | Ranking compartido; desempate manual por comprador (lead time visible como referencia)        |
| Proveedor ganador                         | Un ganador por RFQ completa (no selección por ítem en MVP)                                    |
| Mínimo para comparar                      | ≥2 respuestas con al menos un ítem cotizado cada una                                          |

### 6.6 Dashboard

| ID       | Requisito                                                               | Plan  | MVP |
| -------- | ----------------------------------------------------------------------- | ----- | --- |
| F-DSH-01 | KPIs: cotizaciones activas, respuestas pendientes, total de proveedores | Todos | ✅  |
| F-DSH-02 | Lista de RFQs recientes con estado                                      | Todos | ✅  |
| F-DSH-03 | Timeline de actividad reciente                                          | Todos | V2  |
| F-DSH-04 | Acceso rápido a "Nueva Cotización"                                      | Todos | ✅  |

### 6.7 Historial y Reportes

| ID       | Requisito                                                           | Plan         | MVP |
| -------- | ------------------------------------------------------------------- | ------------ | --- |
| F-HIS-01 | Historial de cotizaciones cerradas con ganadores                    | Todos        | V2  |
| F-HIS-02 | Filtros por rango de fecha                                          | Todos        | V2  |
| F-HIS-03 | Historial limitado a 6 meses                                        | Professional | V2  |
| F-HIS-04 | Historial ilimitado                                                 | Business+    | V2  |
| F-REP-01 | Reporte de resumen: total RFQs, tasa de respuesta, ahorros promedio | Business+    | V3  |
| F-REP-02 | Top proveedores por rendimiento                                     | Business+    | V3  |
| F-REP-03 | Breakdown por categoría                                             | Business+    | V3  |
| F-REP-04 | Reporte de desempeño por proveedor individual                       | Business+    | V3  |

### 6.8 Configuración

| ID       | Requisito                                                         | Plan          | MVP |
| -------- | ----------------------------------------------------------------- | ------------- | --- |
| F-CFG-01 | Perfil de empresa: nombre, moneda predeterminada, zona horaria    | Todos         | ✅  |
| F-CFG-02 | Gestión de usuarios / equipo: invitar, listar y eliminar miembros | Professional+ | V2  |
| F-CFG-03 | CRUD de plantillas de mensajes por canal (email/WhatsApp)         | Business+     | V2  |
| F-CFG-04 | Vista de plan actual, uso, próxima fecha de cobro                 | Todos         | V2  |
| F-CFG-05 | Upgrade de plan                                                   | Todos         | V2  |
| F-CFG-06 | Historial de facturas                                             | Todos         | V3  |

### 6.9 Notificaciones

| ID       | Requisito                                                                  | Plan          | MVP |
| -------- | -------------------------------------------------------------------------- | ------------- | --- |
| F-NOT-01 | Notificación cuando proveedor responde una cotización (email al comprador) | Todos         | V2  |
| F-NOT-02 | Notificación 24h antes de vencer una solicitud                             | Todos         | V2  |
| F-NOT-03 | Notificación de recordatorio enviado exitosamente                          | Todos         | V2  |
| F-NOT-04 | Notificación de nuevo usuario unido al equipo                              | Professional+ | V2  |
| F-NOT-05 | Bandeja de notificaciones in-app con marca de leído/no leído               | Todos         | V2  |

---

## 7. Requisitos No Funcionales

### 7.1 Rendimiento

- Respuesta de API < 300ms en el percentil 95 bajo carga normal (pilotos).
- El comparador debe procesar hasta 10 respuestas y 20 ítems en < 1 segundo (MVP); escalar a 50/100 en V2.
- Las páginas web deben cargar en < 2 segundos (LCP) en conexión 4G.

### 7.2 Seguridad

- Tokens JWT con expiración configurable (default: 24h). Refresh tokens opcionales en MVP.
- Tokens de respuesta de proveedor: UUID v4, expiración igual a `deadline` del RFQ.
- Contraseñas hasheadas con bcrypt (salt rounds ≥ 12).
- Rate limiting en endpoints de auth: máx. 10 intentos/minuto por IP.
- Validación de entradas en todos los endpoints (sanitización contra inyección SQL y XSS).
- HTTPS obligatorio; sin fallback a HTTP.
- Aislamiento multi-tenant: todas las queries filtradas por `companyId`; tests de aislamiento obligatorios antes de piloto.

### 7.3 Disponibilidad

- **MVP piloto:** Best-effort; sin SLA contractual.
- **Post-lanzamiento comercial (V2+):** SLA objetivo 99,5% (Starter/Professional); 99,9% garantizado (Enterprise).

### 7.4 Escalabilidad

- Arquitectura stateless en el backend.
- **MVP:** Envío de email síncrono o cola simple (background task FastAPI). Celery + Redis en V2 cuando volumen lo justifique.
- Base de datos multi-tenant desde el inicio (entidad `Company` obligatoria).

### 7.5 Internacionalización (i18n)

- **MVP:** Español (`es`) e inglés (`en`) vía next-intl. Pilotos en Colombia con copy `es`.
- **V2:** Variantes regionales (`es-MX`, etc.) según expansión.
- Monedas: COP y USD en MVP; conversión informativa manual (sin API de cambio en tiempo real).
- Zona horaria configurable por empresa.

### 7.6 Accesibilidad

- Cumplimiento WCAG 2.1 AA en el formulario público de respuesta del proveedor.
- Formulario del proveedor responsive (mobile-first).

### 7.7 Email transaccional (MVP)

- Dominio verificado con SPF, DKIM y DMARC antes del primer piloto.
- Proveedor: Resend o SendGrid con plantillas en español.
- Monitoreo de bounces y spam reports.

### 7.8 Privacidad y cumplimiento

- Tratamiento de datos personales conforme a Ley 1581 de 2012 (Colombia).
- Términos de uso y aviso de privacidad publicados antes de pilotos.
- Datos de proveedores externos (email, precios) accesibles solo al tenant que los creó.

---

## 8. Arquitectura Técnica

### Stack

| Capa               | Tecnología                                            | Fase     |
| ------------------ | ----------------------------------------------------- | -------- |
| Frontend           | Next.js (App Router), React, TypeScript, Tailwind CSS | MVP      |
| Backend            | FastAPI (Python)                                      | MVP      |
| Base de datos      | PostgreSQL                                            | MVP      |
| Autenticación      | JWT (access token; refresh opcional MVP)              | MVP      |
| Email              | Resend o SendGrid (transaccional)                     | MVP      |
| WhatsApp           | Twilio o 360dialog (Business API)                     | V2       |
| IA extracción      | Claude API o GPT-4V                                   | V3       |
| Storage (archivos) | S3-compatible (adjuntos PDF)                          | V2       |
| Cola de trabajos   | Background tasks FastAPI → Celery + Redis             | MVP → V2 |

> Todos los endpoints REST usan prefijo **`/api/v1`**, alineado con el backend actual.

### Modelo de Datos Principal (entidades)

```
Company          → id, name, taxId, country, currency, timezone, plan, createdAt
User             → id, companyId, name, email, passwordHash, role
Supplier         → id, companyId, name, email, phone, whatsapp, categories[], notes
RFQ              → id, companyId, title, items[], deadline, status, currency, message, createdBy
SupplierRFQ      → id, rfqId, supplierId, token, sentAt, respondedAt, status
Response         → id, rfqId, supplierId, items[{itemId, unitPrice, leadTime, availability, notes}], totalPrice, currency, source
Winner           → id, rfqId, supplierId, selectedAt, selectedBy
Template         → id, companyId, name, subject, body, channel          (V2)
Notification     → id, companyId, userId, type, payload, readAt           (V2)
Subscription     → id, companyId, planId, status, billingCycle            (V2)
Invoice          → id, companyId, subscriptionId, amount, currency        (V3)
```

---

## 9. Pantallas Frontend

### Públicas (sin autenticación)

| Ruta                      | Pantalla                                                 | MVP |
| ------------------------- | -------------------------------------------------------- | --- |
| `/`                       | Landing page (mínima: propuesta de valor + CTA registro) | ✅  |
| `/login`                  | Inicio de sesión                                         | ✅  |
| `/register`               | Registro de empresa                                      | ✅  |
| `/forgot-password`        | Solicitar recuperación de contraseña                     | ✅  |
| `/reset-password`         | Restablecer contraseña con token                         | ✅  |
| `/respond/:token`         | Formulario de respuesta del proveedor                    | ✅  |
| `/respond/:token/success` | Confirmación de envío del proveedor                      | ✅  |

### Privadas (requieren auth)

| Ruta                  | Pantalla                                       | MVP |
| --------------------- | ---------------------------------------------- | --- |
| `/dashboard`          | Dashboard principal                            | ✅  |
| `/rfq`                | Lista de solicitudes de cotización             | ✅  |
| `/rfq/new`            | Crear nueva solicitud                          | ✅  |
| `/rfq/:id`            | Detalle de solicitud + estado de respuestas    | ✅  |
| `/rfq/:id/compare`    | Comparador de cotizaciones                     | ✅  |
| `/suppliers`          | Lista de proveedores                           | ✅  |
| `/suppliers/:id`      | Detalle de proveedor (sin estadísticas en MVP) | ✅  |
| `/onboarding/setup`   | Setup inicial de empresa post-registro         | ✅  |
| `/history`            | Historial de cotizaciones cerradas             | V2  |
| `/reports`            | Reportes y analytics (Business+)               | V3  |
| `/settings/company`   | Configuración de empresa                       | ✅  |
| `/settings/team`      | Gestión de usuarios (Professional+)            | V2  |
| `/settings/templates` | Plantillas de mensajes (Business+)             | V2  |
| `/settings/billing`   | Plan y facturación                             | V2  |
| `/onboarding/plan`    | Selección de plan                              | V2  |

---

## 10. API — Endpoints

> Prefijo base: **`/api/v1`**

### Auth

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
```

### Companies

```
GET    /api/v1/companies/:id
PATCH  /api/v1/companies/:id
GET    /api/v1/companies/:id/members          (V2)
POST   /api/v1/companies/:id/members/invite   (V2)
DELETE /api/v1/companies/:id/members/:userId  (V2)
```

### Suppliers

```
GET    /api/v1/suppliers                (?page=&limit=&search=)
POST   /api/v1/suppliers
GET    /api/v1/suppliers/:id
PATCH  /api/v1/suppliers/:id
DELETE /api/v1/suppliers/:id
POST   /api/v1/suppliers/import         (V2 — Professional+)
```

### RFQ

```
GET    /api/v1/rfq                      (?status=&page=&search=)
POST   /api/v1/rfq
GET    /api/v1/rfq/:id
PATCH  /api/v1/rfq/:id
DELETE /api/v1/rfq/:id
POST   /api/v1/rfq/:id/send
POST   /api/v1/rfq/:id/remind           (V2)
GET    /api/v1/rfq/:id/compare
POST   /api/v1/rfq/:id/winner             (selección ganador)
GET    /api/v1/rfq/:id/export           (V2 — ?format=xlsx|pdf)
```

### Responses

```
GET    /api/v1/rfq/:id/responses
POST   /api/v1/rfq/:id/responses                  (captura manual)
POST   /api/v1/rfq/:id/responses/ai-extract       (V3 — Business+)
```

### Respond (público — sin auth)

```
GET    /api/v1/respond/:token/validate
POST   /api/v1/respond/:token/submit
```

### Templates (V2)

```
GET    /api/v1/templates
POST   /api/v1/templates
PATCH  /api/v1/templates/:id
DELETE /api/v1/templates/:id
```

### Billing (V2)

```
GET    /api/v1/billing/subscription
POST   /api/v1/billing/select-plan
POST   /api/v1/billing/upgrade
GET    /api/v1/billing/invoices
```

### Dashboard y Reportes

```
GET    /api/v1/dashboard/summary
GET    /api/v1/reports/summary          (V3 — ?from=&to=)
GET    /api/v1/reports/suppliers/:id    (V3)
```

### Notificaciones (V2)

```
GET    /api/v1/notifications            (?unread=true)
PATCH  /api/v1/notifications/:id/read
PATCH  /api/v1/notifications/read-all
```

---

## 11. Roadmap de Desarrollo

### MVP — Meses 1–3 (Fase 1)

**Objetivo:** Validar north star con 5–10 empresas piloto en Colombia (plan Starter fijo, email-only).

| Módulo                                   | Frontend | Backend |
| ---------------------------------------- | -------- | ------- |
| Registro, login, onboarding setup        | ✅       | ✅      |
| Entidad Company + multi-tenant           | —        | ✅      |
| CRUD Proveedores + límites plan          | ✅       | ✅      |
| Crear RFQ + borrador + envío email       | ✅       | ✅      |
| Formulario respuesta proveedor (público) | ✅       | ✅      |
| Captura manual                           | ✅       | ✅      |
| Comparador + selección ganador           | ✅       | ✅      |
| Dashboard básico (KPIs + lista RFQs)     | ✅       | ✅      |
| Landing mínima                           | ✅       | —       |

**Fuera del MVP:** WhatsApp, IA, PDF adjuntos, reportes, historial, import CSV, multi-usuario, facturación, recordatorios, timeline actividad, stats proveedor, wizard 4 pasos, Celery, SLA contractual.

---

### Versión 2 — Meses 4–6

- Integración WhatsApp Business API (Twilio / 360dialog)
- Historial de cotizaciones cerradas + stats proveedor
- Recordatorios (manual y automático Business+)
- Plantillas de mensajes personalizables
- Gestión de equipo (multi-usuario)
- Exportación a Excel y PDF
- Adjuntos PDF en formulario proveedor
- Selección de plan y facturación inicial
- Notificaciones (email + bandeja in-app)
- Preview mensaje, vista mix óptimo comparador
- Celery + Redis para envíos asíncronos

---

### Versión 3 — Meses 7–12

- IA para extracción automática de precios desde PDF, imágenes y texto
- Analytics avanzado y predicción de tendencias de precios
- Integración con ERP (SAP, Siesa, World Office)
- API pública para integraciones personalizadas
- Portal de proveedores con perfiles y catálogos
- Facturación automática (Stripe o PSE para Colombia)

---

## 12. Riesgos y Mitigaciones

| Riesgo                                   | Probabilidad | Impacto | Mitigación                                                                |
| ---------------------------------------- | ------------ | ------- | ------------------------------------------------------------------------- |
| Adopción lenta del proveedor             | Media        | Alto    | Sin cuenta requerida; formulario mobile-first; link único por email.      |
| Respuestas no estructuradas              | Alta         | Medio   | Formulario web + captura manual en MVP; IA en V3.                         |
| Emails a spam (deliverability)           | Media        | Alto    | SPF/DKIM/DMARC antes de pilotos; dominio dedicado; monitoreo bounces.     |
| Integración WhatsApp rechazada           | Baja         | Alto    | Post-MVP; Twilio/360dialog para compliance.                               |
| Competencia internacional                | Media        | Medio   | Precio 50–70% inferior, WhatsApp nativo (V2), español, onboarding rápido. |
| Churn alto por falta de valor            | Media        | Alto    | Primera RFQ en <10 min; medir ahorro con pilotos quincenalmente.          |
| Scope creep en MVP                       | Alta         | Alto    | Columna MVP alineada a §14; entregas por vertical slice (§15).            |
| Cumplimiento datos (Ley 1581)            | Media        | Medio   | Aviso de privacidad + términos antes de pilotos; aislamiento tenant.      |
| MVP email-only en mercado WhatsApp-first | Media        | Medio   | Comunicar a pilotos el roadmap; medir tasa respuesta email como baseline. |

---

## 13. Métricas de Éxito (KPIs)

### Fase piloto (meses 1–3)

| KPI                                                                 | Objetivo                    |
| ------------------------------------------------------------------- | --------------------------- |
| North star: RFQs completadas con ≥2 respuestas y ganador registrado | ≥3 / piloto / mes           |
| Tiempo hasta primera RFQ enviada                                    | < 10 minutos desde registro |
| Tasa de respuesta proveedores (email)                               | ≥ 40%                       |
| Pilotos activos                                                     | 5–10 empresas Colombia      |
| NPS piloto                                                          | > 40                        |
| Horas ahorradas (autoreporte)                                       | ≥ 2 h/semana vs manual      |

### Fase SaaS comercial (mes 6+)

| KPI                                              | Objetivo                 |
| ------------------------------------------------ | ------------------------ |
| Tasa de respuesta proveedores (email + WhatsApp) | ≥ 55%                    |
| Churn mensual                                    | < 5%                     |
| CAC payback                                      | < 12 meses               |
| Crecimiento MRR mensual                          | > 15%                    |
| MRR Año 1 (conservador)                          | $12,4M COP / ~$3.000 USD |

---

## 14. Criterios de Aceptación del MVP

1. Un comprador puede registrarse, completar onboarding setup y quedar en plan Starter automáticamente.
2. Un comprador puede agregar hasta 3 proveedores y crear una RFQ en menos de 10 minutos.
3. El backend rechaza crear un 4.º proveedor en plan Starter (403/422), no solo la UI.
4. Cada proveedor recibe un email con link único que abre el formulario de respuesta en móvil sin errores.
5. El proveedor puede completar y enviar su cotización sin registrarse; token inválido tras deadline o segundo envío.
6. El comparador muestra ranking de precios cuando ≥2 proveedores han respondido con al menos un ítem.
7. El comprador puede registrar manualmente una respuesta de proveedor que no usó el formulario web.
8. El comprador puede seleccionar un proveedor ganador y cerrar la RFQ.
9. Aislamiento multi-tenant verificado: tenant A no accede a datos de tenant B.

---

## 15. Orden de Entrega — Vertical Slices

Cada slice cierra un ciclo comprador → proveedor → comparación. No iniciar slice siguiente hasta cumplir criterios de aceptación del anterior.

### Slice A — Company + Proveedores (semanas 1–3)

**Valida:** El comprador puede armar su base de proveedores dentro de límites de plan.

| Incluye                           | Backend | Frontend |
| --------------------------------- | ------- | -------- |
| Entidad `Company`, multi-tenant   | ✅      | —        |
| Registro + login + JWT            | ✅      | ✅       |
| Onboarding setup (sin billing)    | ✅      | ✅       |
| CRUD proveedores + límite Starter | ✅      | ✅       |

**Hecho cuando:** Criterios 1, 2 y 3 de §14 pasan.

---

### Slice B — RFQ + Email + Respuesta pública (semanas 4–7)

**Valida:** El proveedor responde sin cuenta vía email.

| Incluye                               | Backend | Frontend |
| ------------------------------------- | ------- | -------- |
| CRUD RFQ + borrador + estados         | ✅      | ✅       |
| Envío email con token único/proveedor | ✅      | ✅       |
| Formulario público `/respond/:token`  | ✅      | ✅       |
| Validación token + confirmación       | ✅      | ✅       |

**Hecho cuando:** Criterios 4, 5 y 6 de §14 pasan.

---

### Slice C — Comparador + Cierre (semanas 8–10)

**Valida:** El comprador decide con datos comparables.

| Incluye                          | Backend | Frontend |
| -------------------------------- | ------- | -------- |
| Captura manual respuestas        | ✅      | ✅       |
| Comparador ranking + reglas §6.5 | ✅      | ✅       |
| Selección ganador + cierre RFQ   | ✅      | ✅       |

**Hecho cuando:** Criterios 6, 7 y 8 de §14 pasan.

---

### Slice D — Dashboard + Piloto E2E (semanas 11–12)

**Valida:** Producto usable en producción con pilotos reales.

| Incluye                       | Backend | Frontend |
| ----------------------------- | ------- | -------- |
| Dashboard KPIs + lista RFQs   | ✅      | ✅       |
| Landing mínima                | —       | ✅       |
| Deploy + email deliverability | ✅      | —        |
| Onboarding 1–2 pilotos reales | —       | —        |

**Hecho cuando:** Criterio 9 de §14 pasa y al menos 1 piloto completa north star end-to-end.

---

### Playbook piloto (paralelo a Slice D)

- Identificar 5–10 empresas (restaurantes, constructoras, clínicas) en Colombia.
- Sesión onboarding 30 min por empresa; objetivo: primera RFQ en la misma sesión.
- Check-in quincenal: RFQs completadas, tasa respuesta, horas ahorradas, feedback cualitativo.
- Criterio de graduación MVP → V2: ≥5 pilotos con ≥3 RFQs completadas/mes y NPS >40.

---

## 15. Documentación de diseño (planificación)

| Artefacto                                        | Uso                                 |
| ------------------------------------------------ | ----------------------------------- |
| `planing/brand-brief.md`                         | Marca, voz, posicionamiento         |
| `planing/ui-spec.md`                             | Color y tipografía por pantalla MVP |
| `planing/app-flow.md`                            | Flujos, rutas, componentes UI       |
| `planing/color-tokens.json` / `type-tokens.json` | Figma, Agents 03–04                 |
| `planing/README.md`                              | Índice del paquete de planificación |

---

_Documento actualizado el 2026-06-03 — v1.1 alineado con evaluación CEO y estado del repo._
