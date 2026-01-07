# 👥 Gestión del Equipo y Delegación de Tareas

Este documento centraliza la asignación de tareas para los miembros del equipo: **Jose**, **Dani**, y **Nemesio**.
Las tareas están alineadas con las fases del [Roadmap](./roadmap.md) y la [Planificación](./planificacion.md).

## 🎭 Roles Principales (Propuesta)

- **Jose**: Backend Lead & Core Logic (DB, Auth, APIs, Pagos).
- **Dani**: Frontend Lead & UX/UI (Componentes, Layouts, Estilos, Cliente).
- **Nemesio**: DevOps, Infraestructura & QA (CI/CD, Servicios Externos, Documentación).

---

## 🚀 Tareas Actuales (Fase 2 y 3)

### 👨‍💻 Jose (Backend & Data)

- [ ] **Data Model**: Definir esquema inicial en Prisma (`schema.prisma`) basado en `modelado-de-datos.md`.
- [ ] **Auth**: Configurar Clerk en el proyecto y definir Webhooks para sincronización de usuarios.
- [ ] **Integraciones**: Setup inicial de Stripe/PayPal (Credenciales Sandbox).
- [ ] **API**: Definir estructura de Server Actions / API Routes. Configurar Swagger si es necesario para endpoints públicos.

### 🎨 Dani (Frontend & UI)

- [x] **Setup Frontend**: Inicializar proyecto Next.js 16 con Bun.
- [x] **Estilos**: Configurar Tailwind CSS v4 (o v3) y `shadcn/ui` con la paleta de colores del branding.
- [x] **Linting**: Establecer reglas de ESLint y Prettier para consistencia de código.
- [x] **Layouts**: Implementar el Layout Público (Landing) y Layout del Dashboard (Sidebar/Header).

### 🛠️ Nemesio (DevOps & Docs)

- [ ] **Repositorio**: Configurar repositorio GitHub, ramas y protecciones.
- [ ] **CI/CD**: Crear flujos de GitHub Actions para deploy automático en ramas de preview.
- [ ] **Infra**: Setup de proyecto en Supabase (Credenciales, conexión).
- [ ] **Media**: Configurar cuenta y buckets en Bunny.net.
- [ ] **Search**: Levantar instancia de Meilisearch (Docker local o Cloud) y documentar conexión.
- [ ] **Docs**: Mantener actualizados `changelog.md` y `roadmap.md`.

---

## 📋 Backlog Futuro (Por Asignar)

- [ ] Implementación de Búsqueda Avanzada (Jose/Nemesio).
- [ ] Vista de Detalle de Restaurante (Dani).
- [ ] Sistema de Reviews (Dani/Jose).
