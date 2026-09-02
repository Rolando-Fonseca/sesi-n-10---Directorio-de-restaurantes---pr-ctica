# Registro de decisiones de arquitectura

| ADR | Decisión | Estado |
|-----|----------|--------|
| [0001](0001-base-propia-no-ramas-del-equipo.md) | Construir sobre el esqueleto propio, no sobre las ramas del equipo | aceptada |
| [0002](0002-clerk-para-autenticacion.md) | Clerk para autenticación, rol duplicado en Clerk y Prisma | aceptada |
| [0003](0003-servicios-externos-acotados.md) | Acotar Stripe, PayPal, Meilisearch, Bunny, Resend y Upstash | aceptada |
| [0004](0004-api-v1-y-webhooks-salientes.md) | API REST v1 y webhooks salientes firmados como contrato para n8n | aceptada |
| [0005](0005-neon-y-vercel.md) | Neon para PostgreSQL y Vercel para la aplicación | aceptada |

Cada ADR sigue el formato contexto, decisión, consecuencias. Las consecuencias negativas son obligatorias: una decisión sin coste no es una decisión.
