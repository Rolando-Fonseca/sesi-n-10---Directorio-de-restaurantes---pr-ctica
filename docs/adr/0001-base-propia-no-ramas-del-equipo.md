# ADR-0001: Construir sobre el esqueleto propio, no sobre las ramas del equipo

- Estado: aceptada
- Fecha: 2026-09-02

## Contexto

La Sesión 10 fue un ejercicio colaborativo. En el repositorio conviven dos líneas de trabajo:

- Las ramas del equipo original (`origin/neon`, `origin/main-team-a`, `origin/jose-dashboard-ui`), con unos 275 ficheros: Supabase Auth, base de datos en Neon, mapa con Leaflet, checkout con Stripe, facturas en PDF, pedidos en tiempo real.
- La rama `rolando`, con un esqueleto propio de 40 ficheros: esquema Prisma completo, seed de taxonomías, middleware de Clerk, webhook de usuarios y validaciones Zod. Sin interfaz.

La entrega debe presentarse como proyecto individual y servir de base al P5 (automatización con n8n).

## Decisión

Construir sobre la rama `rolando`. No fusionar ni copiar código de las ramas del equipo.

## Consecuencias

Positivas:

- Toda la implementación es explicable línea a línea en la presentación.
- El esquema de datos ya cubre el enunciado completo; no hay que rediseñarlo.
- Control total sobre los servicios externos: solo los que el autor puede mantener.

Negativas:

- Se renuncia a mucha interfaz ya hecha. Hay que construir todas las vistas desde cero.
- El historial de git conserva los commits del equipo previos al esqueleto. Se documenta en el README en lugar de reescribir el historial, para no perder trazabilidad.
- Las decisiones de diseño del equipo (Supabase en vez de Clerk, pedidos en tiempo real) no se heredan; algunas funcionalidades del enunciado se acotan en ADR-0003.
