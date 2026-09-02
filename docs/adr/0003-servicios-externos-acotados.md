# ADR-0003: Acotar los servicios externos del enunciado

- Estado: aceptada
- Fecha: 2026-09-02

## Contexto

El enunciado pide Stripe y PayPal, Meilisearch, Bunny.net, Resend, Upstash Redis y Google Tag Manager con Microsoft Clarity. Cada uno exige cuenta, claves, configuración y en varios casos tarjeta. Para una entrega individual con URL viva, cada servicio añadido es un punto de fallo en la demo y tiempo que no va a dominio. El P5 (n8n) necesita precisamente que las integraciones externas queden como eventos que otro sistema pueda procesar.

## Decisión

| Servicio | Decisión | Cómo queda |
|----------|----------|------------|
| Stripe y PayPal | Fuera. | Los planes se muestran en `/pricing` y el owner "activa" una suscripción simulada que crea `Subscription` e `Invoice` con estado real. Los route handlers de webhook se conservan con el TODO. El esquema ya tiene los campos de Stripe y PayPal. |
| Meilisearch | Fuera. | Búsqueda con `ILIKE` y filtros en PostgreSQL. `src/lib/meilisearch.ts` se mantiene como punto de extensión. |
| Bunny.net | Fuera. | Las imágenes se guardan como URL. Las de ejemplo se generan con claude-banana y viven en `public/images/`. Subida de ficheros por el owner: fuera de alcance. |
| Resend | Fuera de la app. | Los correos los enviará n8n en el P5 a partir de los webhooks salientes. Esto es deliberado: da al P5 un caso de uso real. |
| Upstash Redis | Fuera. | Sin caché ni rate limiting distribuidos. Rate limiting básico en memoria en los route handlers públicos. |
| GTM y Clarity | Fuera. | Variables de entorno previstas; no se cargan scripts. |
| Nominatim | Dentro. | Gratuito, sin clave, con `User-Agent` identificativo y una petición por alta. |

## Consecuencias

Positivas:

- La demo depende solo de Neon, Clerk y Vercel, los tres con capa gratuita y sin tarjeta.
- El tiempo se concentra en el flujo de negocio, que es lo que se evalúa.
- El P5 hereda casos de uso claros: notificar al admin, enviar correos, generar resúmenes con IA.

Negativas:

- No hay cobro real. Se explica en la presentación y queda como siguiente paso documentado en el backlog.
- La búsqueda por texto es más pobre que con Meilisearch (sin tolerancia a erratas ni facetas precalculadas).
- Sin CDN de imágenes, el owner no puede subir fotos propias en esta versión.
- Sin Redis, el rate limiting en memoria se reinicia con cada instancia serverless. Aceptable para una demo académica.
