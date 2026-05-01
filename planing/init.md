# PLATAFORMA DE COTIZACIONES AUTOMATIZADAS

**Resumen Ejecutivo del Plan de Negocio**

---

## 1. CONCEPTO DEL NEGOCIO

### Problema que Resuelve

Las empresas en Colombia y Latinoamérica pierden horas valiosas cada semana contactando proveedores manualmente, consolidando respuestas dispersas en Excel y comparando precios de forma desordenada. Este proceso ineficiente genera:

- Pérdida de productividad (4-8 horas semanales por persona)
- Decisiones de compra subóptimas por falta de visibilidad
- Falta de trazabilidad e historial de negociaciones
- Errores humanos en transcripción y comparación de datos

### Solución Propuesta

Plataforma SaaS que automatiza el proceso completo de cotización B2B a través de:

1. **Gestión centralizada de proveedores** con información de contacto y categorías de productos
2. **Envío automático de solicitudes** vía WhatsApp Business API y email
3. **Captura inteligente de respuestas** (estructuradas, manuales o con IA)
4. **Comparador automático** con ranking de precios y análisis histórico

### Propuesta de Valor Única

**Ventaja competitiva en LATAM:** WhatsApp es el canal dominante para comunicación B2B en la región, a diferencia de mercados desarrollados donde predomina el email. Esta integración nativa con WhatsApp Business API nos posiciona estratégicamente frente a soluciones norteamericanas o europeas.

---

## 2. ESCALABILIDAD INTERNACIONAL

### Factores de Escalabilidad

- **Problema universal:** Todas las empresas del mundo necesitan cotizar con proveedores
- **Infraestructura globalizada:** WhatsApp API disponible en 180+ países, cloud services con presencia global
- **Modelo SaaS:** Costo marginal casi cero para agregar usuarios internacionales
- **Arquitectura multi-idioma y multi-moneda** desde el MVP

### Ruta de Expansión Recomendada

| FASE                   | MERCADOS                                 | RAZÓN ESTRATÉGICA                                                                      |
| ---------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| **Fase 1<br>Años 1-2** | Colombia, México, Chile, Perú, Argentina | Mismo idioma, WhatsApp dominante, cultura empresarial similar                          |
| **Fase 2<br>Año 3**    | España, Portugal, Italia                 | Idioma español/portugués, WhatsApp relevante, PyMEs necesitan digitalización           |
| **Fase 3<br>Años 3-4** | USA, Canadá, Reino Unido                 | Pivot hacia automatización con IA (WhatsApp menos relevante, mayor uso de email/Slack) |

---

## 3. ESTRATEGIA DE PRECIOS

### Modelo de Negocio

SaaS por suscripción mensual con 4 planes diferenciados según volumen de uso y funcionalidades avanzadas.

| PLAN                   | PRECIO COP | PRECIO USD | PROVEEDORES | TARGET            |
| ---------------------- | ---------- | ---------- | ----------- | ----------------- |
| **Gratuito (Starter)** | $0         | $0         | Hasta 3     | Captación         |
| **Professional**       | $149.000   | $35        | Hasta 15    | Pequeñas empresas |
| **Business**           | $349.000   | $85        | Hasta 50    | Empresas medianas |
| **Enterprise**         | $899.000+  | $220+      | Ilimitados  | Grandes empresas  |

#### Descuentos por Prepago

- **Anual (12 meses):** 20% descuento (equivalente a 2 meses gratis)
- **Semestral (6 meses):** 10% descuento

### Características por Plan

#### 🆓 Plan Gratuito - "Starter"

- Hasta 3 proveedores
- Hasta 5 solicitudes de cotización/mes
- 1 usuario
- Envío por email únicamente
- Comparador básico
- Captura manual de respuestas

#### 💼 Plan Professional

- Hasta 15 proveedores
- Hasta 50 solicitudes de cotización/mes
- 3 usuarios
- Envío por email + WhatsApp
- Comparador con ranking automático
- Captura manual + formularios web para proveedores
- Historial de cotizaciones (6 meses)
- Exportar a Excel
- Soporte por email

#### 🚀 Plan Business

- Hasta 50 proveedores
- Solicitudes **ilimitadas**
- 10 usuarios
- Todo lo del plan Professional +
- **IA para extracción automática de precios** (PDFs, imágenes, texto)
- Plantillas personalizadas de mensajes
- Historial ilimitado
- Reportes y analytics
- Recordatorios automáticos a proveedores
- API para integraciones básicas
- Soporte prioritario (chat)

#### 🏢 Plan Enterprise

- Proveedores ilimitados
- Solicitudes ilimitadas
- Usuarios ilimitados
- Todo lo del plan Business +
- **Integración con ERP** (SAP, Siesa, World Office, etc.)
- WhatsApp Business API dedicado
- Gestión de múltiples empresas/sucursales
- Roles y permisos personalizados
- Onboarding personalizado
- Account manager dedicado
- SLA garantizado
- Reportes personalizados
- White label (opcional)

---

## 4. PROYECCIÓN FINANCIERA

### Escenario Conservador - Año 1

| PLAN         | CLIENTES | PRECIO | MRR          | ARR           |
| ------------ | -------- | ------ | ------------ | ------------- |
| Gratuito     | 100      | $0     | $0           | $0            |
| Professional | 30       | $149K  | $4.470K      | $53.640K      |
| Business     | 15       | $349K  | $5.235K      | $62.820K      |
| Enterprise   | 3        | $900K  | $2.700K      | $32.400K      |
| **TOTAL**    | **148**  | -      | **$12.405K** | **$148.860K** |

**MRR Año 1:** ~$12,4 millones COP/mes (~$3.000 USD/mes)  
**ARR Año 1:** ~$148 millones COP (~$36.000 USD/año)

### Escenario Optimista - Año 2

Con crecimiento del 20% mensual y expansión a México:

**MRR Año 2:** ~$45 millones COP/mes (~$11.000 USD/mes)  
**ARR Año 2:** ~$540 millones COP (~$132.000 USD/año)

---

## 5. ROADMAP DE DESARROLLO

### MVP - Meses 1-3

- Envío de cotizaciones por email únicamente
- Formulario web simple para respuesta de proveedores
- Comparador básico con ranking automático
- Captura manual de respuestas
- Validación con 5-10 empresas piloto en Colombia

### Versión 2 - Meses 4-6

- Integración con WhatsApp Business API
- Captura semi-automática de respuestas estructuradas
- Historial y reportes básicos
- Recordatorios automáticos a proveedores
- Plantillas personalizables de mensajes

### Versión 3 - Meses 7-12

- IA para extracción automática de precios de PDFs, imágenes y texto
- Analytics avanzado y predicción de tendencias
- Integraciones con ERP (SAP, Siesa, World Office)
- API pública para integraciones personalizadas
- Portal de proveedores con perfiles públicos

---

## 6. RETOS Y ESTRATEGIAS DE MITIGACIÓN

| RETO                                  | ESTRATEGIA DE MITIGACIÓN                                                                                                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Integración WhatsApp Business API** | Usar proveedor confiable como Twilio o 360dialog que maneje compliance y aprobación de templates. Costo por mensaje debe estar incorporado en pricing del plan Business+.                          |
| **Respuestas no estructuradas**       | Ofrecer múltiples canales de captura: (1) formulario web estructurado, (2) entrada manual asistida, (3) IA para extracción (V3). No depender 100% de automatización desde el inicio.               |
| **Adopción de proveedores**           | El proveedor no necesita registrarse - responde por su canal habitual (WhatsApp/email). Para valor agregado, ofrecer portal opcional donde pueden ver historial de cotizaciones y subir catálogos. |
| **Competencia internacional**         | Diferenciación: (1) Precio 50-70% inferior a Coupa/Procurify, (2) WhatsApp nativo, (3) diseño para informalidad de LATAM, (4) soporte en español, (5) onboarding rápido sin consultoría.           |
| **Diferencias culturales B2B**        | Templates de mensajes personalizables por región. Permitir ajuste de tono (formal vs casual). En LATAM más flexibilidad, en Europa/USA más estructura.                                             |

---

## 7. CONCLUSIONES Y PRÓXIMOS PASOS

### Conclusiones Clave

1. **Problema validado:** La gestión manual de cotizaciones es un dolor real en empresas medianas de LATAM.

2. **Ventaja competitiva sólida:** WhatsApp Business API como canal nativo es una diferenciación clara en el mercado latinoamericano frente a competidores internacionales.

3. **Escalabilidad internacional confirmada:** El modelo SaaS permite expansión con costo marginal mínimo. Ruta clara: LATAM → Europa del Sur → Mercados anglosajones.

4. **Pricing competitivo:** Planes entre $149K-$899K COP justificados por ROI claro (ahorro de 4-8 horas semanales por empleado).

5. **Viabilidad financiera:** ARR proyectado de $148M COP en año 1 (conservador) con camino hacia $540M+ en año 2.

### Recomendaciones Inmediatas

1. **Validar MVP con pilotos:** Identificar 5-10 empresas en Colombia (restaurantes, constructoras, clínicas) para testear versión email-only en los próximos 90 días.

2. **Construir con mentalidad global:** Arquitectura multi-idioma y multi-moneda desde día 1, pero ejecutar con foco hiperlocal en Colombia inicialmente.

3. **Explorar partnerships estratégicos:** Contactar gremios empresariales (ANDI, Cámaras de Comercio) y proveedores de ERP para canales de distribución.

4. **Preparar fundraising:** Con producto validado (mes 6-9), buscar pre-seed de fondos regionales ($200K-$500K USD) para acelerar desarrollo de WhatsApp API y expansión a México.

5. **Definir métricas de éxito:** Churn <5% mensual, CAC payback <12 meses, NPS >40, crecimiento MRR >15% mensual.

### Visión a 3 Años

Convertirnos en la plataforma líder de automatización de cotizaciones B2B en Latinoamérica, procesando más de 100.000 solicitudes mensuales para 1.000+ empresas en 5 países, con presencia emergente en España y preparación para entrada al mercado norteamericano.

---

_Documento generado el 1 de mayo de 2026_
