# Foodzinder

Directorio especializado de restaurantes con sistema de suscripción, geolocalización y gamificación.

## Stack

- **Runtime**: Bun
- **Framework**: Next.js 16 (App Router, Server Actions, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui (new-york, primary `#f67499`)
- **Font**: Urbanist
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Upstash Redis
- **Auth**: Clerk
- **Search**: Meilisearch
- **Storage**: Bunny.net CDN
- **Payments**: Stripe + PayPal
- **Email**: Resend + React Email

## Commands

```bash
bun run dev          # Dev server with Turbopack
bun run build        # Production build
bun run lint         # ESLint
bun run type-check   # TypeScript check
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run migrations
bun run db:seed      # Seed database
bun run db:studio    # Prisma Studio
bun run test         # Jest tests
```

## Architecture

- `src/app/(public)/` — Public routes (home, explore, restaurant detail, pricing, legal)
- `src/app/(auth)/` — Clerk auth pages (sign-in, sign-up)
- `src/app/(dashboard)/` — Protected routes (admin, owner, user)
- `src/app/api/webhooks/` — Webhook handlers only (Clerk, Stripe, PayPal)
- `src/server/actions/` — Server Actions (mutations)
- `src/server/queries/` — Server Queries (reads with Redis cache)
- `src/server/services/` — Business logic layer
- `src/lib/validations/` — Zod schemas per domain
- `src/components/features/` — Feature-specific components
- `src/components/ui/` — shadcn/ui primitives

## Conventions

- Server Actions pattern: Zod validate -> Clerk auth -> Role check -> Business logic -> Cache invalidation -> Meilisearch sync -> Notification
- User.id = Clerk user ID (synced via webhook)
- Role stored in Clerk publicMetadata for middleware, and in Prisma User for business logic
- All mutations go through `src/server/actions/`
- All reads go through `src/server/queries/` with Redis caching
- Meilisearch sync via Redis queue, processed by cron
- Restaurant status: PENDING -> APPROVED/REJECTED, Owner can ARCHIVE

## Docker

```bash
docker compose up -d    # PostgreSQL 17, Redis 7, Meilisearch v1.12
```

## Environment

Copy `.env.example` to `.env` and fill in the values.
