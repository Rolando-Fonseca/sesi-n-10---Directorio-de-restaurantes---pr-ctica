# Guion de demo (5 minutos)

Objetivo: enseñar el flujo de negocio completo y el enganche con el P5 sin leer código. Antes de empezar: sesión de administrador abierta en una pestaña, ventana de incógnito en otra, un `webhook.site` abierto y `WEBHOOK_URLS` apuntando a él.

| Min | Qué se enseña | Dónde | Qué decir |
|-----|---------------|-------|-----------|
| 0:00 | Home y búsqueda por plato | `/` → buscar «paella» | "Se busca por lo que hay en carta, no solo por nombre. Sale Arroces del Turia porque tiene paella en su carta." |
| 0:40 | Explorar con «cerca de mí» y mapa | `/explore` → Cerca de mí → Mapa | "Geolocalización del navegador, distancia calculada en servidor, mapa de OpenStreetMap sin claves de pago." |
| 1:20 | Ficha con alérgenos | `/restaurant/casa-terral` → marcar «Gluten» | "Los catorce alérgenos del reglamento europeo. Con perfil, se preseleccionan solos. Los platos no desaparecen: se marcan, la persona decide." |
| 2:00 | Alta de restaurante como dueño | incógnito → `/sign-up` → `/dashboard/owner/restaurants/new` | "Formulario con mapa para colocar el local. Al enviar, la cuenta pasa a dueño y la ficha queda pendiente. Fíjate en el webhook.site: acaba de llegar `restaurant.created` firmado." |
| 3:00 | Aprobación por admin | pestaña admin → `/dashboard/admin` → Aprobar | "El admin lo aprueba (o lo rechaza con motivo). Llega `restaurant.approved` con la URL pública. Ya aparece en `/explore`." |
| 3:40 | Reseña con cuatro notas | incógnito → ficha → reseña | "Ambiente, servicio, comida y precio. La media se recalcula, el dueño recibe aviso y llega `review.created`. Puntos e insignia para quien opina." |
| 4:20 | API para automatizar | terminal → `curl -H "X-Api-Key: …" …/api/v1/admin/stats?period=7d` | "Todo lo que ha pasado está disponible por API con clave. Esto y los webhooks son el contrato del P5: n8n avisará, resumirá con IA y aprobará desde fuera." |
| 4:50 | Cierre | `docs/` en GitHub | "Decisiones en ADRs con su coste, 68 tests, contrato de API escrito antes que el código." |

## Preguntas probables

- **¿Por qué no hay cobro real?** ADR-0003: cada pasarela añade cuenta, tarjeta y un punto de fallo en la demo. El esquema ya tiene los campos de Stripe y PayPal; la suscripción simulada genera factura con IVA real.
- **¿Por qué Clerk y no Supabase Auth?** ADR-0002: el rol viaja en la sesión y el middleware decide sin tocar la base de datos.
- **¿Qué pasa si la URL del webhook está caída?** Tres reintentos (2 s, 8 s, 30 s), registro de cada intento en el panel de admin y reintento manual o por API.
- **¿Y sin JavaScript o para Google?** Las fichas llevan JSON-LD `Restaurant` con la carta, sitemap y robots; los revelados por scroll solo se ocultan si hay JavaScript.
- **¿Se puede reutilizar el código del equipo original?** ADR-0001: no se usó. El enunciado y la marca son del ejercicio; la implementación es propia y está explicada en `docs/prompts.md`.

## Antes de presentar

- [ ] Ping a la demo dos minutos antes (Neon y Vercel despiertan en frío).
- [ ] Comprobar que `WEBHOOK_URLS` apunta al `webhook.site` abierto.
- [ ] Tener un restaurante rechazable a mano (Gràcia Verde está pendiente en el seed).
- [ ] Terminal con el `curl` preparado y la clave en una variable.
