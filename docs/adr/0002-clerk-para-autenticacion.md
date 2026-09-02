# ADR-0002: Clerk para autenticación, con el rol duplicado en Clerk y en Prisma

- Estado: aceptada
- Fecha: 2026-09-02

## Contexto

El sistema tiene tres roles con rutas protegidas distintas. El middleware de Next.js corre en el edge y no debería consultar la base de datos en cada petición. El equipo original descartó Clerk y usó Supabase Auth; el esqueleto propio ya trae Clerk configurado con middleware y webhook.

## Decisión

Usar Clerk. El rol se guarda en `publicMetadata.role` (Clerk) y en `User.role` (Prisma). Clerk es la fuente de verdad de identidad; Prisma la de negocio. El webhook de Clerk sincroniza altas, cambios y bajas. Cualquier cambio de rol se hace desde una Server Action que actualiza ambos sitios en la misma operación.

## Consecuencias

Positivas:

- El middleware decide con los claims de sesión, sin tocar la base de datos.
- Registro, login social, recuperación de contraseña y gestión de sesiones vienen resueltos; el tiempo va a dominio.
- Capa gratuita suficiente para la demo (10.000 usuarios activos mensuales).

Negativas:

- Dependencia de un proveedor externo: la demo necesita claves de Clerk y un webhook apuntando a la URL desplegada.
- Dos copias del rol pueden desincronizarse si alguien edita `publicMetadata` a mano en el panel de Clerk. Mitigación: el webhook `user.updated` vuelve a escribir el rol en Prisma.
- En local, el webhook no llega sin un túnel. Mitigación: `syncClerkUser()` en `src/lib/auth.ts` hace un upsert perezoso en la primera visita autenticada.
