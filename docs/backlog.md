# Backlog por fases

Cada fase termina en uno o varios commits atómicos y en una verificación concreta. Nada se marca hecho sin esa verificación.

## Fase 0: limpieza y documentación base

- [x] Eliminar los 168 ficheros compilados por `tsc` y blindar `.gitignore`.
- [x] README con origen, autoría, alcance y estado.
- [x] `docs/architecture.md`, ADRs 0001 a 0005, `docs/api.md`, este backlog, `docs/setup-servicios.md`, `docs/prompts.md`, `CHANGELOG.md`.
- [x] Ajustar `CLAUDE.md` al alcance real y añadir al `.env.example` las variables de API y webhooks.

Verificación: `git status` limpio, `bun run type-check` en verde.

## Fase 1: infraestructura y datos

- [x] Base de datos en Neon y `.env` local (guía en `docs/setup-servicios.md`).
- [x] Aplicación en Clerk con claves (la clave secreta responde). Webhook y rol `OWNER` desde la app: quedan para las fases 2 y 6.
- [x] Primera migración `init` y migraciones versionadas en git.
- [x] `WebhookDelivery` y `Restaurant.gallery` en el esquema. Corregida la unicidad de slug de taxonomía (por ámbito).
- [x] Seed de demo idempotente: 12 restaurantes en cuatro ciudades con coordenadas, 12 cartas, 65 platos con alérgenos, 25 reseñas, 1 admin, 4 owners y 8 usuarios.
- [x] Fotos de portada y de plato destacado generadas con claude-banana en `public/images/`.
- [x] Vitest en lugar de Jest, 14 tests en verde.

Verificación hecha: migraciones y seed contra Neon sin errores; medias de reseñas recalculadas; `bun run test` y `type-check` en verde.

## Fase 2: capa de servidor

- [x] `src/server/queries/`: restaurantes (búsqueda con filtros, radio y paginación; ficha con carta por categorías y desglose de valoraciones; por owner; por estado), cartas, taxonomías, reseñas, wishlist agrupada con totales, usuarios, notificaciones, planes, entregas de webhooks y estadísticas por periodo.
- [x] `src/server/services/`: restaurantes (alta con geocodificación Nominatim y límite por plan, edición, máquina de estados con eventos, reasignación), cartas, categorías y platos (límites por plan), reseñas (una por usuario y restaurante, medias recalculadas, moderación), wishlist, puntos e insignias, suscripción simulada con factura e IVA, usuarios (rol en Clerk y Prisma a la vez), taxonomías.
- [x] `src/server/actions/`: helper `runAction` y acciones para restaurantes, cartas, reseñas, wishlist, cuenta y administración (incluido evento de prueba y reintento de webhooks).
- [x] `src/server/events/`: tipos de evento, firma HMAC-SHA256, entrega con 3 reintentos y registro en `webhook_deliveries`, ejecución fuera de la petición con `after()`.
- [x] Webhook de Clerk reescrito sobre el servicio de usuarios (emite `user.created` una sola vez).
- [x] 46 tests unitarios (firma, entrega, máquina de estados, valoraciones, geodistancia, facturación, validaciones).

Verificación hecha: `type-check`, lint y tests en verde. Prueba de integración contra Neon (reseña, puntos, wishlist, transiciones, suscripción con factura) y contra un receptor HTTP local que verificó la firma de los webhooks y registró el fallo de una URL caída con reintentos. Datos de demo restaurados al terminar.

## Fase 3: sitio público

- [x] Base de componentes shadcn/ui (Radix, Lucide) y tokens de marca con contraste verificado (ver `globals.css`).
- [x] Layout público: cabecera con menú móvil (Sheet) y sesión de Clerk, pie con enlaces legales, enlace "saltar al contenido".
- [x] Home: hero con buscador y collage, destacados (uno grande + lista numerada), cocinas, cómo funciona, llamada a dueños.
- [x] `/explore`: filtros en la URL (texto, ciudad, cocina, características, precio), "cerca de mí" con radio, lista o mapa Leaflet, paginación, estado vacío y esqueleto de carga.
- [x] `/restaurant/[slug]`: cabecera con portada y tarjeta de datos, carta por categorías con filtro de alérgenos preseleccionado desde el perfil, wishlist, desglose de valoraciones, formulario de reseña, mapa y cómo llegar, 404 propio.
- [x] `/categories`, `/pricing` con los planes del seed y `/legal/[page]`.
- [x] SEO: metadatos por ficha, Open Graph, JSON-LD `Restaurant` con carta, sitemap y robots.
- [x] Revisión visual con Playwright a 1440, 768 y 375 px (home, explorar, ficha) recorriendo la página con scroll; consola sin errores; revelados por scroll solo con `@media (scripting: enabled)` para que rastreadores y navegadores sin JS vean todo el contenido.
- [x] Revisión de movimiento: sin `ease-in`, sin `transition: all` (el botón de shadcn se acota a propiedades con nombre), sin `scale(0)`, pulsación `scale(0.97)`, zoom de imagen solo con ratón, modo reducido respetado.

Verificación hecha: `type-check` y lint limpios; todas las rutas responden 200 y las no publicadas 404; capturas en los tres anchos sin bloques ocultos ni errores de consola.

## Fase 4: paneles

- [x] Layout de panel con navegación por rol (barra lateral en escritorio, panel deslizante en móvil), avisos sin leer y `Toaster` de Sonner. Helper `requireUser` con sincronización perezosa desde Clerk.
- [x] Owner: resumen con límites del plan y rechazos destacados; restaurantes con formulario completo (mapa para colocar y ajustar el marcador, geocodificación desde el navegador o en servidor, taxonomías por familias) y acciones de estado; cartas con editor de platos (categorías locales, alérgenos, presentación, disponibilidad, destacado); reseñas recibidas; plan y facturación simulados con datos fiscales; facturas con IVA desglosado.
- [x] Admin: resumen con las mismas cifras que la API privada y cola de aprobación; restaurantes por estado con aprobar, rechazar con motivo y reasignar dueño; vista de revisión de una ficha con carta y mapa; usuarios y roles (escribe en Clerk y Prisma); taxonomías (CRUD con desactivación si están en uso); moderación de reseñas; webhooks con destinos, entregas, reintento y evento de prueba.
- [x] Usuario: resumen con puntos y nivel, perfil con alérgenos y preferencias, insignias e historial de puntos, platos guardados agrupados por restaurante con total, reseñas propias.
- [ ] Flujo completo probado en navegador con una cuenta real de Clerk: registro, alta de restaurante, aprobación por admin, ficha pública, reseña. Pendiente de que el usuario cree su cuenta (docs/setup-servicios.md, apartado 6).

Verificación hecha: `type-check` y lint limpios; las rutas del panel redirigen a `/sign-in` sin sesión.

## Fase 5: API v1, webhooks y contrato

- [x] Route handlers públicos (`/restaurants`, `/restaurants/{slug}`, `/restaurants/{slug}/reviews`, `/taxonomies`, `/plans`) y privados (`/admin/restaurants`, approve, reject, `/admin/reviews`, `/admin/stats`, `/admin/webhook-deliveries`, retry, `/admin/webhooks/test`) más el índice `GET /api/v1`. Envoltura común, `DomainError` y `ZodError` convertidos en códigos HTTP.
- [x] Límite de peticiones en memoria (60/min público, 120/min privado) con cabeceras `X-RateLimit-*` y `429` con `Retry-After`; clave de API comparada en tiempo constante; `/api/*` fuera del middleware de Clerk.
- [x] 22 tests nuevos: límite de peticiones y 17 de contrato contra Neon (envoltura, códigos, cabeceras, 401, 400, 404, 409, rechazar y aprobar con restaurante de prueba efímero).
- [x] Evento de prueba desde el panel de admin y desde la API.
- [ ] Webhook de prueba recibido en un `webhook.site` desde la demo desplegada (Fase 6, cuando haya URL y `WEBHOOK_URLS` en Vercel).

Verificación hecha: 68 tests en verde; `curl` contra el servidor local devuelve lo documentado.

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
