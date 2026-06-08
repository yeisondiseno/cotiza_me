# Brand Brief — CotizaMe

**Versión:** 1.0  
**Fecha:** 2026-06-03  
**Estado:** Aprobado para diseño MVP  
**Referencias:** `PRD.md`, `init.md`, `user-flow.md`, `app-flow.md`, `ui-spec.md`  
**Implementación técnica:** `front/src/app/globals.css`, `front/messages/{es,en}.json`

> Documento canónico de marca para Agent 01 y entrada de Agents 02–07.  
> Copia para agentes: `.claude/references/brand-brief.md` (apunta aquí).

---

## 1. Contexto de producto

```yaml
product:
  internal_name: cotiza_me
  wordmark: "CotizaMe"
  category: B2B SaaS — automatización de cotizaciones / RFQ
  what: Centraliza solicitudes de cotización, respuestas de proveedores y comparación de propuestas.
  monetization: SaaS por suscripción (Starter → Enterprise)
  delivery: Web multi-tenant, locales es (default) | en
  stack:
    framework: Next.js 16 + React 19 + TypeScript
    styling: Tailwind CSS v4 (@theme en globals.css)
    i18n: next-intl 4
    fonts:
      display: Plus Jakarta Sans
      body: DM Sans
      mono: DM Mono

audience:
  primary: PYME y mid-market en Colombia / LATAM — compras recurrentes B2B
  secondary: Líderes de operaciones / procurement que huyen del ida-y-vuelta email–Excel
  literacy: Usuarios operativos + decisores (CFO/COO miran comparador y totales)

value_props:
  - Un solo lugar para RFQs y respuestas de proveedores
  - Comparación lado a lado (precio, plazos, condiciones)
  - Trazabilidad de cada decisión de compra
  - Onboarding ligero (sin SSO obligatorio en MVP)
  - MVP: email; V2: WhatsApp nativo (diferenciador LATAM)
```

---

## 2. Personalidad y posicionamiento

### Aaker — personalidad de marca

| Dimensión                  | Peso       | Manifestación en producto                                             |
| -------------------------- | ---------- | --------------------------------------------------------------------- |
| **Competence** (primaria)  | Alta       | UI ordenada, datos claros, estados explícitos, lenguaje preciso       |
| **Sincerity** (secundaria) | Media      | Transparencia en límites de plan, errores honestos, sin dark patterns |
| Excitement                 | Baja       | El ámbar en CTAs aporta energía sin parecer startup consumer          |
| Ruggedness                 | Baja       | —                                                                     |
| Sophistication             | Media-baja | Profesional, no lujo corporativo                                      |

### Arquetipo Jung

- **Primario — El Gobernante (Ruler):** El comprador controla el proceso de cotización; la plataforma le devuelve poder sobre proveedores dispersos.
- **Secundario — El Sabio (Sage):** Comparador e historial ayudan a decidir con datos, no con intuición.

### Positioning statement

> Para equipos de compras B2B en LATAM que hoy cotizan por correo y Excel, **CotizaMe** es la plataforma que centraliza RFQs y compara propuestas de proveedores en un solo lugar, porque elimina el ida-y-vuelta manual y deja trazabilidad de cada decisión de compra.

### Tagline (propuesta MVP)

| Locale | Tagline                                 | Uso                                |
| ------ | --------------------------------------- | ---------------------------------- |
| **es** | Cotiza más rápido. Decide con claridad. | Landing hero, OG, email bienvenida |
| **en** | Quote faster. Decide with clarity.      | Landing hero, OG                   |

Alternativa corta solo logo: **CotizaMe** (sin tagline en sidebar).

---

## 3. Atributos de diseño (dirección, no especificación pixel)

Estos atributos alimentan Agents 03–06. Los valores ancla viven en `globals.css` y se detallan en `ui-spec.md`.

```yaml
current_brand_attributes:
  tone: [confiable, directo, operativo]
  energy: medium
  formality: balanced # B2B sin ser distante
  warmth: neutral-warm # navy frío + accent ámbar cálido
  complexity: simple
  era_reference: contemporary B2B SaaS (Linear / Stripe-adjacent, no enterprise grey)

  color_direction:
    temperature: cool primary + warm accent
    saturation: medium
    mood: "Confianza institucional + acción comercial"
    anchors:
      primary: "#0C4A6E" # navy/teal — confianza
      accent: "#F59E0B" # ámbar — CTA y decisión
      surface: "#F8FAFC" # slate claro — fondo app

  type_direction:
    personality: sans humanista + grotesque neutra
    pairing: Plus Jakarta Sans (display) + DM Sans (body) + DM Mono (números)
    style: jerarquía clara; números siempre alineados (tabular)

  logo_direction:
    type: combination (símbolo + wordmark "CotizaMe")
    current_state: placeholder lucide Zap en Sidebar — formalizar en Agent 02
    style: minimal, geométrico, monocromo adaptable a primary
    must_communicate: [confianza B2B, velocidad de cotización, claridad]
```

---

## 4. Voz y tono editorial

### Reglas globales

| Regla       | es                                             | en                   |
| ----------- | ---------------------------------------------- | -------------------- |
| Tratamiento | **Tú** informal-profesional                    | **You** estándar B2B |
| Oraciones   | Cortas, activas, sin jerga legal               | Same                 |
| Errores     | Explicar qué pasó + qué hacer                  | Same                 |
| Éxito       | Confirmar resultado + siguiente paso si aplica | Same                 |

### Léxico canónico (no mezclar sin motivo)

| Concepto               | Término UI (es)         | UI (en)            | Evitar                    |
| ---------------------- | ----------------------- | ------------------ | ------------------------- |
| RFQ                    | Solicitud de cotización | Quote request      | "Pedido", "Order"         |
| Cotización (respuesta) | Cotización / Propuesta  | Quote / Proposal   | "Oferta" ambigua          |
| Proveedor              | Proveedor               | Supplier           | "Vendor" en es            |
| Comparador             | Comparador              | Compare            | "Vs" coloquial en títulos |
| Enviar RFQ             | Enviar cotización       | Send quote request | "Disparar", "Lanzar"      |

### Tono por superficie

| Superficie                         | Tono                  | Ejemplo es                                          |
| ---------------------------------- | --------------------- | --------------------------------------------------- |
| **Marketing** (landing)            | Inspirador + concreto | "Deja el Excel. Cotiza en minutos."                 |
| **Auth / onboarding**              | Acogedor, breve       | "Configura tu empresa en un paso."                  |
| **App (app shell)**                | Operativo, neutro     | "3 respuestas pendientes"                           |
| **Transaccional** (toast)          | Directo               | "Proveedor creado."                                 |
| **Destructivo / irreversible**     | Sobrio + consecuencia | "Esta acción cerrará la solicitud."                 |
| **Proveedor público** (`respond/`) | Respetuoso, claro     | "Por favor cotiza los siguientes ítems."            |
| **Email RFQ**                      | Formal ligero         | "Estimado proveedor, lo invitamos a cotizar…"       |
| **Email sistema** (reset)          | Neutro, sin culpa     | "Si el email está registrado, recibirás un enlace." |

### Longitud y layout

- **es** y **en** tienen longitud similar en MVP; reservar ~25% más ancho en botones del Header para futuro DE/FR.
- Títulos de página: máx. ~40 caracteres recomendado.
- Microcopy de badge: 1–2 palabras (`Enviada`, `Borrador`).

---

## 5. Mensajes clave por contexto (MVP)

| Contexto            | Mensaje clave                                     | CTA principal                |
| ------------------- | ------------------------------------------------- | ---------------------------- |
| Landing             | Automatiza cotizaciones B2B sin cambiar tu ERP    | Registrarse gratis           |
| Registro            | Crea tu espacio de trabajo en minutos             | Registrarse                  |
| Onboarding          | Moneda y zona horaria para cotizaciones correctas | Continuar al dashboard       |
| Dashboard           | Vista operativa del día                           | Nueva cotización             |
| Wizard RFQ paso 4   | Revisa antes de enviar a proveedores              | Enviar cotización            |
| Comparador          | Elige al proveedor ganador con datos claros       | Seleccionar … como proveedor |
| Respond (proveedor) | Cotiza sin crear cuenta                           | Enviar cotización            |
| Límite plan         | Transparencia, no culpa                           | Actualizar plan (V2)         |

---

## 6. Coherencia cross-canal

| Canal           | Debe reflejar                                                        |
| --------------- | -------------------------------------------------------------------- |
| App `(app)/`    | Shell navy sidebar, fondo slate, CTA ámbar                           |
| Auth `(auth)/`  | Misma paleta, sin sidebar; logo centrado                             |
| Respond público | Logo + nombre empresa compradora; sin nav app                        |
| Emails HTML     | `#0C4A6E` header o botón primario; CTA ámbar para link de cotización |
| Favicon / OG    | Símbolo sobre `#0C4A6E` o fondo claro — sync con `globals.css`       |

---

## 7. Decision log

| Decisión             | Elección                            | Alternativa descartada | Razón                                |
| -------------------- | ----------------------------------- | ---------------------- | ------------------------------------ |
| Wordmark             | CotizaMe                            | Rebrand                | Ya en producto y código              |
| Primary              | Navy `#0C4A6E`                      | Verde fintech          | Confianza B2B institucional          |
| Accent CTA           | Ámbar `#F59E0B`                     | Primary como CTA       | Von Restorff: un solo foco de acción |
| Tipografía           | Plus Jakarta + DM Sans + DM Mono    | Inter-only             | Diferenciación sin serif             |
| Tratamiento es       | Tú                                  | Usted                  | PYME LATAM, cercanía operativa       |
| WhatsApp en copy MVP | Mencionar como "próximamente" en UI | Prometer activo        | PRD: canal en V2                     |
| Dark mode            | No MVP                              | —                      | Documentar en ui-spec como v2 diseño |

---

## 8. Handoff a otros agentes

| Agente           | Lee de este brief                 |
| ---------------- | --------------------------------- |
| 02 Identity/Logo | `logo_direction`, anchors primary |
| 03 Color         | `color_direction`, decision log   |
| 04 Typography    | `type_direction`                  |
| 05 UI/UX         | Tono transaccional, léxico badges |
| 06 Spacing       | — (usa ui-spec layouts)           |
| 07 Maquetación   | Mensajes §5 + `app-flow.md`       |

**Siguiente paso diseño:** `ui-spec.md` (tokens por pantalla) → Agent 06 spacing → Figma o implementación en `front/`.

---

_Documento creado el 2026-06-03_
