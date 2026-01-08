# 📅 Planificación del Proyecto: Foodzinder

Este documento describe las fases para el desarrollo de la aplicación web Foodzinder.

## Fase 1: Definición y Estrategia (Estado Actual)

- [x] Definición de identidad visual y branding.
- [x] Elección del stack tecnológico.
- [x] Definición de roles y funcionalidades principales.
- [ ] Creación de artefactos de arquitectura y modelo de datos.

## Fase 2: Configuración del Entorno (Siguiente Paso)

- **Repositorio y CI/CD:**
  - Configuración inicial de Git y GitHub.
  - Setup de GitHub Actions para deploy en preview.
- **Infraestructura Base:**
  - Inicialización de Next.js 16 con Bun.
  - Configuración de Tailwind CSS y shadcn/ui.
  - Configuración de linter y formateo (ESLint, Prettier).
- **Servicios Externos:**
  - Setup de proyecto en Supabase (PostgreSQL).
  - Configuración de Clerk (Auth).
  - Configuración inicial de Stripe/PayPal (Sandbox).
  - Setup de cuenta en Bunny.net (Media).
  - Setup de Meilisearch (Docker/Cloud).

## Fase 3: Core y Autenticación

- **Base de Datos:**
  - Implementación del esquema Prisma inicial.
  - Migraciones iniciales.
- **Autenticación:**
  - Integración de Clerk Provider.
  - Webhooks de Clerk para sincronizar tabla `Users` en DB.
  - Roles y Permisos (Middleware de protección de rutas).
- **Layouts Principales:**
  - Layout público (Landing, Buscador).
  - Layout de Dashboard (Sidebar, Header autenticado).

## Fase 4: Desarrollo de Funcionalidades (Sprints)

### Sprint 1: Gestión de Restaurantes (Owners y Admins)

- CRUD de Restaurantes (Crear, Editar, Listar propios).
- Flujo de Aprobación por Admin.
- Gestión de Menús y Platos.
- Subida de imágenes a Bunny.net.

### Sprint 2: Suscripciones y Pagos

- Integración de Stripe/PayPal para planes de suscripción (Owners).
- Lógica de acceso restringido según plan (si aplica).
- Sistema de cupones.

### Sprint 3: Experiencia de Usuario (Consumidores)

- Home Page con destacados.
- Buscador con Meilisearch (Filtros por taxonomías).
- Integración de OpenStreetMap (Geolocalización).
- Vista de detalle de Restaurante y Menú.

### Sprint 4: Social y Gamificación

- Sistema de Reseñas (Texto + Fotos).
- Sistema de Favoritos/Deseos (Lista lateral).
- Lógica básica de Gamificación (Puntos).

## Fase 5: Optimización y Lanzamiento

- **SEO Técnico:** Metadatos dinámicos, Sitemap.
- **Analytics:** Google Tag Manager, Clarity.
- **Performance:** Optimización de imágenes, consulta a DB.
- **Testing Final:** QA manual y tests E2E críticos.
- **Deploy a Producción:** Configuración de VPS Hostinger + Easypanel.
