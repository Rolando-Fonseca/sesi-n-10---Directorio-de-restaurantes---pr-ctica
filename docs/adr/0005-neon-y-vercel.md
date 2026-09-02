# ADR-0005: Neon para PostgreSQL y Vercel para la aplicación

- Estado: aceptada
- Fecha: 2026-09-02

## Contexto

La entrega exige una URL viva. La aplicación es Next.js con Server Actions y Prisma, así que necesita un runtime de Node y un PostgreSQL accesible desde él. Restricciones conocidas de entregas anteriores:

- El sandbox anónimo de Vercel usado en P3 ya no existe; hay que importar el repositorio desde una cuenta propia.
- La capa gratuita de Supabase no le resultó viable al autor en la Sesión 9 (acabó pagando un VPS un mes).
- GitHub Pages solo sirve estáticos; no vale para este proyecto.

## Decisión

- **Base de datos:** Neon, plan gratuito, región `eu-central-1`. Cadena de conexión con pooling para la aplicación y directa para las migraciones.
- **Aplicación:** Vercel, plan Hobby, importando el repositorio de GitHub. Producción desde `main`, previews por pull request.
- **Migraciones:** `prisma migrate deploy` se ejecuta en el paso de build de Vercel (`vercel-build`), de modo que cada despliegue lleva el esquema al día.
- **Seed:** manual, una vez, desde local contra Neon con `bun run db:seed`.

## Consecuencias

Positivas:

- Cero coste y sin tarjeta.
- Vercel es el hosting de referencia de Next.js: Server Actions, `after()` y caché funcionan sin configuración.
- Neon escala a cero cuando no hay tráfico, lo que encaja con una demo académica.

Negativas:

- Arranque en frío: la primera petición tras inactividad tarda unos segundos (Neon despierta el cómputo y Vercel la función). Se avisa en la presentación y se puede mitigar con un ping periódico desde n8n, que además es un caso de uso legítimo del P5.
- El plan gratuito de Neon limita almacenamiento y horas de cómputo; sobrado para la demo, no para producción real.
- Vercel Hobby prohíbe uso comercial. Irrelevante aquí; se anota por si el proyecto cambiara de naturaleza.
