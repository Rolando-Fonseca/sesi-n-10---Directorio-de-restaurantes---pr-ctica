# Foodzinder

Directorio de restaurantes con roles (admin, owner, usuario), aprobación de fichas, cartas con alérgenos, geolocalización, reseñas multicriterio y gamificación. Proyecto P4 del curso; base del P5 (automatización con n8n).

Antes de tocar código, leer `docs/architecture.md`, `docs/api.md` y `docs/backlog.md`. Las decisiones cerradas están en `docs/adr/`; si algo las contradice, se abre un ADR nuevo, no se ignora.

## Stack

- **Runtime**: Bun
- **Framework**: Next.js 16 (App Router, Server Actions, Turbopack), React 19
- **Lenguaje**: TypeScript estricto
- **Estilos**: Tailwind CSS 4 + shadcn/ui, primario `#f67499`, fuente Urbanist
- **Base de datos**: PostgreSQL (Neon) + Prisma 6
- **Auth**: Clerk (rol en `publicMetadata` y en `User.role`)
- **Mapas**: OpenStreetMap + Leaflet, geocodificación con Nominatim
- **Tests**: Vitest
- **Deploy**: Vercel

Fuera de alcance (ADR-0003): Stripe, PayPal, Meilisearch, Bunny.net, Resend, Upstash. Sus clientes en `src/lib/` se conservan como puntos de extensión; no añadir código que dependa de ellos.

## Comandos

```bash
bun run dev          # servidor de desarrollo
bun run build        # build de producción
bun run lint         # ESLint
bun run type-check   # tsc --noEmit
bun run test         # Vitest
bun run db:generate  # cliente Prisma
bun run db:migrate   # migraciones en desarrollo
bun run db:seed      # datos de ejemplo
bun run db:studio    # Prisma Studio
```

## Arquitectura

- `src/app/(public)/` — home, explore, restaurant/[slug], pricing, legal
- `src/app/(auth)/` — sign-in, sign-up (Clerk)
- `src/app/(dashboard)/` — admin, owner, user (protegidos por rol)
- `src/app/api/v1/` — API REST pública y privada (contrato en `docs/api.md`)
- `src/app/api/webhooks/clerk/` — único webhook entrante
- `src/server/queries/` — lecturas tipadas, sin efectos
- `src/server/actions/` — mutaciones (Server Actions)
- `src/server/services/` — lógica de negocio pura, testeable sin Next
- `src/server/events/` — eventos de dominio: `Notification` + webhooks salientes firmados
- `src/lib/validations/` — esquemas Zod por dominio
- `src/components/features/` — componentes por dominio; `src/components/ui/` — primitivas shadcn

## Convenciones

- Server Action: validar con Zod → `requireAuth`/`requireRole` → servicio → `revalidatePath`. Devuelve `ActionResponse<T>`, nunca lanza al cliente.
- Toda mutación pasa por `src/server/actions/`; toda lectura por `src/server/queries/`.
- `User.id` es el id de Clerk. Cambios de rol se hacen en Clerk y en Prisma en la misma acción.
- Restaurante: `PENDING` → `APPROVED` | `REJECTED`; el owner puede `ARCHIVED`. Solo `APPROVED` es público.
- Cada transición de estado y cada alta relevante emite un evento por `src/server/events/emit.ts`.
- Textos de interfaz en español. Sin emojis como iconos: Lucide.
- Commits atómicos en español con el porqué. Verificar `type-check` y tests antes de cada commit.
- No ejecutar `tsc` sin `--noEmit`: el `.gitignore` bloquea la salida, pero mejor no generarla.

## Entorno

Copiar `.env.example` a `.env`. Guía de cuentas y variables en `docs/setup-servicios.md`. Nunca pegar claves en el chat ni en commits.
