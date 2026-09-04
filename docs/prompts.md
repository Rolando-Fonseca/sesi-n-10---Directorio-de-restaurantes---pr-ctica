# Ingeniería de contexto: cómo se orquestó la IA

Registro de **qué se pidió a la IA, en qué orden y con qué contexto** para llevar la Sesión 10 de "esqueleto de un ejercicio en equipo" a "proyecto individual presentable y base del P5". Como en P3 y P7, el valor no está en los prompts literales sino en la estrategia: qué contexto se carga antes de pedir nada, en qué orden se piden las cosas y qué se verifica después de cada paso.

## Fase 0: diagnóstico antes que código

Primer prompt de la sesión: *"revisa qué tenemos para terminarlo y presentarlo, la idea es tomar este como base para el proyecto 5, que es una automatización con n8n"*. Deliberadamente sin pedir código.

Contexto que la IA cargó antes de responder:

- Memoria de sesiones anteriores: la fórmula que funcionó en P7 (docs-first, tests, trío de URLs) y la lección del admin sobre la URL viva del backend.
- El repositorio completo: árbol de ficheros, `git log`, ramas remotas, `package.json`, `CLAUDE.md`, esquema Prisma, cada fichero de `src/`.
- Las ramas del equipo original, para saber qué existía y decidir si reutilizarlo.
- Las herramientas instaladas en la máquina (Bun, Node, `gh`, `n8n`, Docker) para no proponer nada que no se pudiera ejecutar.

Resultado: un diagnóstico con tres hallazgos que cambiaron el plan.

1. **El esqueleto compilaba pero no tenía nada que enseñar.** 40 fuentes, 54 carpetas vacías, páginas de tres líneas. Sin ese dato, el plan habría subestimado el trabajo.
2. **Las ramas del equipo tenían siete veces más código**, pero con otro proveedor de auth, credenciales ajenas y sin autoría propia. Esto se convirtió en el ADR-0001.
3. **168 ficheros compilados ensuciaban el árbol de trabajo.** Invisibles en el editor, ruido en cada diff futuro. Se verificó uno a uno que cada `.js` tenía su gemelo `.ts` antes de borrar nada.

**Lección:** pedir diagnóstico antes que código convierte a la IA de generador a ingeniero. La decisión más importante del proyecto (qué base usar) salió de leer, no de escribir.

## Fase 0, segunda parte: decidir con el usuario, no por él

El diagnóstico terminó con cuatro preguntas cerradas (base, servicios externos, despliegue, alcance) y una recomendación para cada una. El usuario contestó en una frase. Lo que aportó el usuario y la IA no sabía: que la capa gratuita de Supabase no le había servido en la Sesión 9. Eso fijó Neon en el ADR-0005.

**Lección:** las preguntas con recomendación incluida se responden en segundos; las preguntas abiertas se quedan sin responder.

## Fase 0, tercera parte: documentar el objetivo antes de construirlo

Orden de escritura, elegido a propósito:

1. `.gitignore` y limpieza: trabajar sobre un repo sucio contamina todo lo posterior.
2. ADRs: cada decisión con su coste. Escribir las consecuencias negativas obliga a comprobar que la decisión se sostiene.
3. `docs/api.md`: el contrato que consumirá n8n se escribe **antes** de implementar nada, porque es la interfaz entre dos proyectos. Si cambia después, cambia con un ADR.
4. `docs/architecture.md` y backlog por fases con verificación explícita.
5. README al final, cuando describe lo que existe y lo que falta con honestidad (tabla de estado).

**Lección:** en un proyecto que será base de otro, el contrato entre ambos es el documento más valioso. Se escribió con la vista puesta en los casos de uso del P5, no en lo que era cómodo implementar.

## Fase 1: infraestructura con las cuentas del usuario

El usuario creó Neon y Clerk y pegó las claves en un documento versionado. La IA las movió al `.env` antes de cualquier commit, restauró el documento y lo verificó con `grep`. Ninguna clave salió de la máquina.

**Lección:** el primer paso tras recibir credenciales es comprobar dónde están, no usarlas. Y la guía de configuración debe decir explícitamente "pégalo en este fichero exacto", con la ruta completa, porque "en el `.env`" no fue suficiente.

El seed de demo se escribió en dos ficheros: datos puros (`seed-data.ts`, legible por cualquiera) y lógica de inserción idempotente (`seed-demo.ts`). El primer intento falló por un bug real del esquema (slug único global en taxonomías, cuando "tapas" existe en dos ámbitos). Se corrigió el esquema con una migración en lugar de renombrar el dato.

**Lección:** un seed con datos realistas es también un test del esquema. Vale la pena escribirlo antes que la interfaz.

## Fase 2: capa de servidor, del contrato hacia dentro

Orden de escritura, de fuera hacia dentro:

1. **Eventos y firma** (`src/server/events/`), porque `docs/api.md` ya fijaba su forma y son la interfaz con el P5.
2. **Servicios puros** (máquina de estados, valoraciones, geodistancia, facturación), con tests sin base de datos. Aquí se decidieron las reglas de negocio con ejemplos concretos: la media global es media de puntuaciones y no de medias; un owner no reseña su propio local; sin plan hay un restaurante gratuito.
3. **Servicios con Prisma**, que solo orquestan lo anterior y lanzan `DomainError` con código estable.
4. **Queries**, que devuelven los mismos DTOs que la API pública documentada, para que páginas y route handlers no diverjan.
5. **Server Actions** con un único helper `runAction`: validar, autenticar, rol, servicio, revalidar. Ninguna acción repite ese código.

Verificación en tres niveles antes del commit: 46 tests unitarios, una prueba de humo de las queries contra Neon con los datos reales del seed (búsqueda "paella", radio de 5 km desde la Puerta del Sol, ficha con alérgenos), y una prueba de integración que ejecutó reseña, puntos, wishlist, transiciones de estado, suscripción con factura y **webhooks contra un receptor HTTP local que verificó la firma HMAC** y registró el fallo de una URL caída. Al terminar, dejó los datos de demo como estaban.

**Lección:** el receptor local de webhooks fue la prueba más barata y la que más confianza dio: demuestra el contrato del P5 antes de que exista n8n.

## Fase 3: sitio público, con el contraste calculado antes que el color

Antes de escribir CSS se calculó el contraste WCAG del rosa de marca con un script de diez líneas: 2,7:1 con texto blanco, insuficiente. La decisión salió del número, no del gusto: el rosa queda para fondos y detalles, y una frambuesa más profunda (5,2:1) lleva botones y enlaces. El comentario con las cifras está en `globals.css` para quien venga después.

Orden de construcción: tokens y layout raíz, luego componentes compartidos (tarjeta, estrellas, buscador), luego páginas de más tráfico a menos (home, explorar, ficha), y por último cocinas, planes y legales. Cada página se comprobó con `curl` (código HTTP) antes de abrir un navegador.

Dos correcciones que solo aparecieron al mirar la página de verdad:

1. Las capturas de página completa salían con secciones en blanco. Causa: el revelado por scroll ocultaba el contenido hasta que el observador de intersección lo mostraba, y en una captura completa (o para un rastreador sin JavaScript) eso nunca ocurre. Se resolvió ocultando solo bajo `@media (scripting: enabled)`. Un primer intento con una etiqueta `<script>` en línea generó un error de React en navegación cliente y se descartó.
2. shadcn genera `transition-all` en los botones; la regla del proyecto es transicionar propiedades con nombre. Se acotó desde `globals.css` en lugar de tocar los componentes generados.

**Lección:** el panel de navegador integrado dio capturas poco fiables al hacer scroll; un guion de Playwright de treinta líneas que recorre la página y cuenta los bloques ocultos fue más rápido y dejó una prueba repetible.

## Fase 4: paneles, un solo patrón para todas las acciones

Con la capa de servidor cerrada, los tres paneles (dueño, administrador, usuario) se construyeron sobre dos piezas genéricas: `requireUser` para la sesión y `ActionButton` para ejecutar cualquier Server Action con confirmación, toast y refresco. Ninguna página repite ese código. El lint atrapó un error real, un componente definido dentro del render en el formulario de restaurante, que en producción habría hecho perder el foco al escribir.

**Lección:** lo que no se puede probar en navegador sin una cuenta real (crear cuentas está fuera de lo que la IA puede hacer) se compensa con tipos estrictos, lint y un patrón único; la prueba manual queda para el usuario con pasos exactos en `docs/setup-servicios.md`.

## Fase 5: la API, del contrato hacia dentro, y el test como prueba de que el documento es cierto

Los route handlers se escribieron leyendo `docs/api.md` como especificación, sin volver a decidir nada: formas de respuesta, códigos, cabeceras y límites ya estaban fijados en la Fase 0. Los tests de contrato ejecutan cada handler con un `Request` real contra la base de datos del seed y comprueban exactamente lo que dice el documento; el flujo rechazar y aprobar usa un restaurante de prueba que el propio test crea y borra.

Verificación en dos niveles: 68 tests (17 de contrato) y `curl` contra el servidor local para ver cabeceras y códigos con los ojos.

**Lección:** escribir el contrato antes que el código convierte los tests en una comprobación de que la documentación no miente, y deja a n8n un documento que ya está probado.

## Convenciones de trabajo con la IA en este proyecto

- Un commit por fase o sub-fase, mensaje en español con el porqué.
- Verificación antes de cada commit: `type-check`, tests y, cuando hay interfaz, capturas.
- Rutas absolutas siempre que se pide al usuario tocar un fichero.
- Nada de claves en el chat: el usuario las pone en el `.env` siguiendo `docs/setup-servicios.md`.

*(Este documento se amplía al cerrar cada fase.)*
