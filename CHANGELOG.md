# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/). Versionado semántico.

## [Unreleased]

### Añadido
- Capa de servidor completa: eventos de dominio con webhooks salientes firmados (HMAC-SHA256, tres reintentos, auditoría en `webhook_deliveries`), servicios de restaurantes, cartas, reseñas, wishlist, gamificación, suscripción simulada, usuarios y taxonomías; queries tipadas con los DTOs de `docs/api.md`; Server Actions con el helper `runAction`.
- Geocodificación de direcciones con Nominatim al dar de alta un restaurante sin coordenadas.
- Límites por plan (restaurantes, cartas, platos por carta) con un plan gratuito implícito de un restaurante.
- 32 tests nuevos sobre firma, entrega, máquina de estados, valoraciones, geodistancia y facturación.
- Base de datos en Neon con migraciones versionadas (`init` y `taxonomy_slug_por_ambito`), `directUrl` para migrar por conexión directa.
- Modelo `WebhookDelivery` para auditar los eventos salientes y campo `gallery` en `Restaurant`.
- Datos de demostración idempotentes: 13 usuarios, 12 restaurantes en Madrid, Barcelona, Valencia y Sevilla con coordenadas reales, 12 cartas, 65 platos con alérgenos y presentación, 25 reseñas con cuatro criterios y medias recalculadas, una notificación de restaurante pendiente. Se omiten con `SEED_DEMO=false`.
- Fotos de portada y de plato destacado generadas con claude-banana en `public/images/`.
- Vitest en lugar de Jest, con 14 tests sobre slugs, puntos y validación de reseñas. Scripts `vercel-build` y `postinstall`.
- Documentación base: README, arquitectura, ADRs 0001 a 0005, contrato de API v1 y webhooks, backlog por fases, guía de servicios externos y registro de prompts.
- Reglas en `.gitignore` para impedir que una salida accidental de `tsc` vuelva a ensuciar `src/` y `prisma/`.

### Corregido
- El slug de taxonomía era único global, y "tapas" existe como cocina y como categoría de carta: el seed pisaba una con la otra. Ahora la unicidad es por ámbito más slug.

### Eliminado
- 168 ficheros `.js`, `.d.ts` y `.map` generados por un `tsc` accidental que duplicaban cada fuente TypeScript.

## [0.1.0] - 2026-05-12

### Añadido
- Esqueleto del proyecto: Next.js 16, Tailwind 4, Prisma con esquema completo (usuarios, taxonomías, restaurantes, menús, platos, reseñas, wishlist, planes, suscripciones, facturas, cupones, gamificación, notificaciones).
- Seed de taxonomías (cocinas, tipos de local, características, preferencias, presentaciones, 14 alérgenos UE, categorías de carta), tres planes y siete insignias.
- Middleware de Clerk con protección de rutas por rol y webhook de sincronización de usuarios.
- Esquemas Zod por dominio y utilidades de geolocalización, puntos y slugs.
- Docker Compose para PostgreSQL, Redis y Meilisearch en local; workflow de CI inicial.
