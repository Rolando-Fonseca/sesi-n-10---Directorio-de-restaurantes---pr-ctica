# Foodzinder

Directorio de restaurantes con roles (administrador, dueño, usuario), aprobación de fichas, cartas con alérgenos, geolocalización, reseñas multicriterio y gamificación. Proyecto **P4** del módulo (Sesión 10), construido orquestando IA con foco en ingeniería de contexto, y diseñado para ser la base del **P5** (Sesión 17: automatización de procesos con n8n).

> **Demo:** https://foodzinder.vercel.app · **API viva:** https://foodzinder.vercel.app/api/v1 · **Repo:** https://github.com/Rolando-Fonseca/sesi-n-10---Directorio-de-restaurantes---pr-ctica (rama `rolando`)
>
> **Docs:** [arquitectura](docs/architecture.md) · [API y webhooks](docs/api.md) · [ADRs](docs/adr/) · [ingeniería de contexto](docs/prompts.md) · [guion de demo](docs/demo.md) · [puente a n8n](docs/n8n-integration.md) · [changelog](CHANGELOG.md)

```bash
# La API pública responde sin clave; la privada, con X-Api-Key (ver docs/api.md)
curl "https://foodzinder.vercel.app/api/v1/restaurants?query=paella"
```

## Origen y autoría

El enunciado, la identidad visual y el modelo de negocio salieron del ejercicio colaborativo de la Sesión 10 (equipo de CodeIA-Academy). Esta implementación es individual: parte de un esqueleto propio (rama `rolando`), con su propio esquema de datos, autenticación con Clerk y decisiones de alcance documentadas en ADRs. No reutiliza el código de las ramas del equipo. Ver [ADR-0001](docs/adr/0001-base-propia-no-ramas-del-equipo.md).

## Qué demuestra este proyecto

- **Dominio real con roles y flujo de aprobación:** el dueño crea el restaurante, el administrador lo aprueba o lo rechaza, y solo entonces aparece en el directorio público.
- **Cartas con alérgenos según el Reglamento UE 1169/2011:** los 14 alérgenos de declaración obligatoria son taxonomías del sistema y filtran la carta según el perfil del usuario.
- **Geolocalización sin servicios de pago:** Nominatim (OpenStreetMap) para geocodificar direcciones y Haversine en servidor para "cerca de mí".
- **Reseñas multicriterio:** ambiente, servicio, comida y relación calidad/precio, con media ponderada por restaurante.
- **Preparado para automatización:** API REST versionada y webhooks salientes firmados para que n8n reaccione a los eventos del sistema. Ver [docs/api.md](docs/api.md).

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) con React 19 |
| Lenguaje | TypeScript en modo estricto |
| Estilos | Tailwind CSS 4 con tokens de diseño propios, fuente Urbanist |
| Base de datos | PostgreSQL (Neon) con Prisma 6 |
| Autenticación | Clerk (roles en `publicMetadata`, sincronizados por webhook) |
| Validación | Zod, un esquema por dominio en `src/lib/validations/` |
| Mapas | OpenStreetMap + Leaflet, geocodificación con Nominatim |
| Tests | Vitest (servicios, validaciones y contratos de API) |
| Despliegue | Vercel, CI con GitHub Actions |

Lo que el enunciado pedía y queda fuera del alcance de esta entrega, con el porqué, está en [ADR-0003](docs/adr/0003-servicios-externos-acotados.md): Stripe y PayPal reales, Meilisearch, Bunny.net, Resend y Upstash.

## Estado

| Fase | Contenido | Estado |
|------|-----------|--------|
| 0 | Limpieza del repo y documentación base | Hecha |
| 1 | Infraestructura: Neon, Clerk, migraciones, seed con datos reales y fotos | Hecha |
| 2 | Capa de servidor: queries, actions, servicios, eventos de dominio | Hecha |
| 3 | Sitio público: home, explorar con mapa, ficha de restaurante | Hecha |
| 4 | Paneles de dueño, administrador y usuario | Hecha |
| 5 | API v1, webhooks salientes, tests de contrato | Hecha |
| 6 | CI en verde, despliegue en Vercel | Hecha |

Tests: 71 (unitarios y de contrato). CI: [GitHub Actions](https://github.com/Rolando-Fonseca/sesi-n-10---Directorio-de-restaurantes---pr-ctica/actions). El detalle de cada fase está en [docs/backlog.md](docs/backlog.md).

## Cómo ejecutarlo

Requisitos: Bun 1.3 o superior y una base de datos PostgreSQL (Neon en producción; en local sirve Docker con `docker compose up -d postgres`).

```bash
bun install
cp .env.example .env        # rellenar DATABASE_URL y las claves de Clerk
bun run db:generate
bun run db:migrate
bun run db:seed
bun run dev
```

Otros comandos:

```bash
bun run build        # build de producción
bun run lint         # ESLint
bun run type-check   # tsc --noEmit
bun run test         # tests
bun run db:studio    # Prisma Studio
```

La guía paso a paso para crear las cuentas de Neon, Clerk y Vercel está en [docs/setup-servicios.md](docs/setup-servicios.md).

## Despliegue

Vercel (región de Londres, junto a Neon) desde la rama `rolando` con su integración de GitHub. `vercel-build` ejecuta `prisma migrate deploy` antes de compilar, así cada despliegue lleva el esquema al día. CI en GitHub Actions: lint, tipos, migraciones y seed sobre un PostgreSQL efímero, tests y build. Decisiones y límites en [ADR-0005](docs/adr/0005-neon-y-vercel.md).

Aviso para la demo: Neon y Vercel arrancan en frío tras inactividad; la primera petición puede tardar unos segundos.

## Estructura

```
src/
├── app/
│   ├── (public)/        # home, explore, restaurant/[slug], pricing, legal
│   ├── (auth)/          # sign-in, sign-up (Clerk)
│   ├── (dashboard)/     # admin, owner, user (protegidos por rol)
│   └── api/
│       ├── v1/          # API REST pública y privada (consumida por n8n)
│       └── webhooks/    # entrada: Clerk
├── server/
│   ├── queries/         # lecturas (Server Components)
│   ├── actions/         # mutaciones (Server Actions)
│   ├── services/        # lógica de negocio y eventos de dominio
│   └── events/          # emisor de webhooks salientes
├── components/
│   ├── ui/              # primitivas shadcn/ui
│   └── features/        # componentes por dominio
├── lib/                 # db, auth, geolocation, points, validations
└── types/
prisma/                  # schema, migraciones, seed
docs/                    # arquitectura, ADRs, API, backlog, prompts
```

## Licencia

Uso académico. Marca y contenidos de ejemplo ficticios.
