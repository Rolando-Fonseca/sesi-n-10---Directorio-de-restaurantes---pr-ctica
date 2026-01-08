# 🏗 Arquitectura del Proyecto: Foodzinder

## Resumen del Stack Tecnológico

El proyecto está construido sobre una arquitectura moderna, escalable y tipos seguros (Type-Safe), priorizando el rendimiento y la experiencia de desarrollo.

### 🎨 Frontend (Cliente)

- **Framework:** Next.js 16 (App Router)
  - _Ventaja:_ Rendering híbrido (SSR/ISR) para SEO óptimo y velocidad.
- **Lenguaje:** TypeScript (Strict Mode).
- **Estilos:** Tailwind CSS + shadcn/ui.
  - Diseño responsive y accesible "out of the box".
- **Estado Global:** Zustand (si es necesario) o Context API nativo.
- **Mapas:** Integración directa con OpenStreetMap (Leaflet o MapLibre).

### ⚙️ Backend (Servidor)

- **Ejecución:** Next.js Server Actions.
  - Elimina la necesidad de una API REST separada para la mayoría de operaciones CRUD.
- **Base de Datos:** PostgreSQL v17 (versión más reciente).
  - _Features Clave:_ Mejor rendimiento en JSONB (ideal para metadatos flexibles), mejoras en optimizador de consultas.
  - Alojado en Supabase (verificar compatibilidad) o VPS propio.
- **ORM:** Prisma.
  - Gestión de esquema y migraciones declarativas.
- **Cola de Trabajos / Caché:** Redis (Upstash) para rate limiting y cacheo de respuestas pesadas.

### 🔐 Servicios Externos (SaaS)

- **Autenticación:** **Clerk**.
  - Gestión de identidad, sesiones y roles (MFA, Social Login).
- **Busqueda:** **Meilisearch**.
  - Motor de búsqueda tolerante a tipografías y filtros facetados rápidos.
- **Almacenamiento (Media):** **Bunny.net**.
  - CDN global para imágenes y vídeos de reseñas/platos.
- **Pagos:** **Stripe** y **PayPal**.
  - Gestión de suscripciones recurrentes para Owners.
- **Email:** **Resend** + **React Email**.

---

## Diagrama de Flujo de Datos (Alto Nivel)

1. **Cliente Web** solicita página -> **Next.js (Edge/Node)** renderiza HTML.
2. **Usuario** interactúa (Login) -> **Clerk** valida -> Redirecciona con Token.
3. **Usuario** realiza acción (ej: Crear Restaurante) -> **Server Action** recibe petición.
   - Valida permisos (Admin/Owner).
   - Valida datos (Zod).
   - Escribe en **PostgreSQL** vía **Prisma**.
   - Sube imágenes a **Bunny** (si aplica).
   - Actualiza índice en **Meilisearch** (evento asíncrono o webhook).
4. **Usuario** busca restaurante -> **Cliente** consulta **Meilisearch** directamente o vía Proxy API para resultados instantáneos.

## Estructura de Directorios Propuesta

```bash
/src
  /app              # Rutas de Next.js (App Router)
    /(public)       # Rutas públicas (Home, Search)
    /(auth)         # Rutas de autenticación (Login, Register)
    /(dashboard)    # Rutas protegidas (Admin, Owner, User Profile)
    /api            # Webhooks (Stripe, Clerk) y endpoints específicos
  /components
    /ui             # Componentes base (shadcn/ui buttons, inputs)
    /features       # Componentes complejos por funcionalidad (ej: restaurant-card)
  /lib
    prisma.ts       # Cliente Prisma singleton
    utils.ts        # Utilidades generales
    validations.ts  # Esquemas Zod compartidos
  /server
    /actions        # Server Actions (mutaciones de backend)
    /queries        # Funciones de lectura de datos (Data Access Layer)
  /types            # Definiciones de tipos globales TypeScript
```
