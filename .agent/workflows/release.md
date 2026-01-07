---
description: Proceso de liberación de versión (Release) con actualización de docs y git tags
---

Sigue estos pasos para realizar una liberación de versión (Release):

1.  **Determinar Versión SemVer**:

    - Analiza los cambios realizados desde el último release.
    - Decide si el incremento es PATCH (fix), MINOR (feat) o MAJOR (breaking change).
    - Define la nueva versión (ej. `1.0.1`).

2.  **Actualizar Documentación**:

    - Edita `docs/changelog.md`: Añade una nueva sección al principio con la nueva versión y la fecha de hoy. Mueve los cambios de "Unreleased" a esta nueva sección.
    - Edita `README.md`: Si contiene la versión del proyecto, actualízala.

3.  **Archivar Artefactos**:

    - Identifica la ruta actual de los artefactos en `.gemini/antigravity/brain/<conversation-id>/`.
    - Copia `task.md` a `docs/tasks.md` (Sobrescribir si existe).
    - Copia `walkthrough.md` a `docs/walkthrough.md` (Solo si existe en el origen).
    - _Comando sugerido:_ `cp <ruta_origen>/task.md docs/tasks.md`

4.  **Confirmar Cambios (Git Add/Commit)**:

    - Agrega todos los cambios al stage: `git add .`
    - Realiza el commit usando Conventional Commits:
    - Comando: `git commit -m "chore: release <VERSION> - <RESUMEN BREVE>"`

5.  **Crear Tag y Push**:
    - Crea el tag anotado: `git tag -a v<VERSION> -m "Release <VERSION>"`
    - Sube los cambios: `git push`
    - Sube los tags: `git push origin v<VERSION>`

**Nota:** Solicita confirmación al usuario antes de ejecutar los comandos de Git finales (pasos 4 y 5) si no estás seguro.
