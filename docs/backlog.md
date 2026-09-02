# Backlog por fases

Cada fase termina en uno o varios commits atómicos y en una verificación concreta. Nada se marca hecho sin esa verificación.

## Fase 0: limpieza y documentación base

- [x] Eliminar los 168 ficheros compilados por `tsc` y blindar `.gitignore`.
- [x] README con origen, autoría, alcance y estado.
- [x] `docs/architecture.md`, ADRs 0001 a 0005, `docs/api.md`, este backlog, `docs/setup-servicios.md`, `docs/prompts.md`, `CHANGELOG.md`.
- [x] Ajustar `CLAUDE.md` al alcance real y añadir al `.env.example` las variables de API y webhooks.

Verificación: `git status` limpio, `bun run type-check` en verde.

## Fase 1: infraestructura y datos

- [ ] Base de datos en Neon y `.env` local (guía en `docs/setup-servicios.md`).
- [ ] Aplicación en Clerk con claves y webhook; rol `OWNER` asignable desde la app.
- [ ] Primera migración (`prisma migrate dev --name init`) y quitar `prisma/migrations/` del `.gitignore` (las migraciones deben versionarse).
- [ ] Añadir al esquema `WebhookDelivery` y el campo `Restaurant.gallery String[]`.
- [ ] Ampliar el seed: 12 restaurantes reales de Madrid, Barcelona, Valencia y Sevilla con coordenadas, 4 cartas, 40 platos con alérgenos, 25 reseñas, 1 admin, 4 owners y 8 usuarios de ejemplo (sin depender de Clerk para los datos de ejemplo).
- [ ] Imágenes de ejemplo generadas con claude-banana (portada por restaurante y algunos platos) en `public/images/`.
- [ ] Cambiar Jest por Vitest y dejar `bun run test` funcionando con un test trivial.

Verificación: `bun run db:migrate && bun run db:seed` contra Neon sin errores; `bun run test` en verde.

## Fase 2: capa de servidor

- [ ] `src/server/queries/`: restaurantes (público, por owner, por estado), menús, taxonomías, reseñas, wishlist, notificaciones, estadísticas.
- [ ] `src/server/services/`: restaurantes (crear con geocodificación, actualizar, aprobar, rechazar, archivar, reenviar), menús y platos, reseñas (recalcular medias), wishlist, puntos e insignias, suscripción simulada.
- [ ] `src/server/actions/`: una Server Action por mutación con el patrón validar, autenticar, rol, servicio, revalidar.
- [ ] `src/server/events/`: emisor de eventos, firma HMAC, reintentos con `after()`, registro en `webhook_deliveries`.
- [ ] Tests unitarios de servicios y validaciones.

Verificación: tests en verde; cada servicio cubierto al menos por un caso feliz y uno de error.

## Fase 3: sitio público

- [ ] Layout público: cabecera con buscador y menú móvil, pie con enlaces legales.
- [ ] Home: hero con buscador, restaurantes destacados, cocinas, cómo funciona, llamada a dueños.
- [ ] `/explore`: lista con filtros (cocina, características, precio, radio), vista mapa con Leaflet, "cerca de mí", estados de carga, vacío y error.
- [ ] `/restaurant/[slug]`: hero con portada, datos y mapa, carta por categorías con filtro de alérgenos del usuario, reseñas con desglose, botón de wishlist.
- [ ] `/pricing` con los planes del seed y `/legal/*`.
- [ ] SEO: metadatos por ficha, Open Graph, JSON-LD `Restaurant`, sitemap y robots.

Verificación: capturas a 375, 768, 1024 y 1440 px; auditoría SEO; sin errores de hidratación en consola.

## Fase 4: paneles

- [ ] Layout de dashboard con navegación por rol.
- [ ] Owner: listado y formulario de restaurante (dirección con geocodificación y ajuste en mapa), cartas y platos, asignación de cartas, suscripción simulada, facturas.
- [ ] Admin: cola de aprobación con motivo de rechazo, taxonomías (CRUD), usuarios y roles, notificaciones, entregas de webhooks.
- [ ] Usuario: perfil con preferencias y alérgenos, reseñas propias, wishlist agrupada por restaurante con total, puntos e insignias.

Verificación: flujo completo probado en navegador: registro de owner, alta de restaurante, aprobación por admin, ficha pública visible, reseña de usuario.

## Fase 5: API v1, webhooks y contrato

- [ ] Route handlers públicos y privados según `docs/api.md`.
- [ ] Rate limiting en memoria y clave de API.
- [ ] Tests de contrato de cada endpoint y de la firma de webhooks.
- [ ] Endpoint de prueba de webhook desde el panel de admin ("enviar evento de prueba").

Verificación: tests de contrato en verde; `curl` contra la demo devuelve lo documentado; un webhook de prueba llega a un `webhook.site`.

## Fase 6: calidad y despliegue

- [ ] CI: lint, type-check, tests y build en cada push y PR.
- [ ] Vercel: importar repo, variables de entorno, `vercel-build` con `prisma migrate deploy`.
- [ ] Webhook de Clerk apuntando a la URL de producción.
- [ ] Revisión de accesibilidad (contraste, foco, etiquetas) y de rendimiento (imágenes con `next/image`, fuentes con `display: swap`).
- [ ] Actualizar README con las URLs y `CHANGELOG` con la versión 1.0.0.

Verificación: trío de URLs (repo, demo, API viva con `curl`), CI en verde, `npm run build` sin avisos.

## Fase 7: presentación

- [ ] Guion de demo de 5 minutos: alta de restaurante, aprobación, ficha pública, reseña, evento de webhook visible.
- [ ] `docs/prompts.md` cerrado con las lecciones de ingeniería de contexto.
- [ ] Puente al P5: qué eventos existen y qué automatizará n8n.

## Fuera de alcance (documentado, no olvidado)

- Cobro real con Stripe y PayPal (ADR-0003).
- Búsqueda con Meilisearch, subida de imágenes a CDN, correos desde la app.
- Reservas, pedidos, chat, i18n (fuera también del MVP original del equipo).
- PostGIS para búsquedas geográficas a gran escala.
