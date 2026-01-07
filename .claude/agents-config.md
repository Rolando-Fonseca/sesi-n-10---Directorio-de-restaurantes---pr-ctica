# Configuración de Agentes - Foodzinder

Este archivo centraliza la información de todos los agentes especializados del proyecto Foodzinder.

## Estructura de Agentes

### 1. **The Architect** (Meta-Agent / Orquestador)

- **Role**: Supervisión global y orquestación
- **Responsabilidades**:
  - Interpretar requerimientos de negocio
  - Coordinar comunicación entre sub-agentes
  - Mantener coherencia del proyecto
- **Skills**: System Design, Agile Management, Technical Writing
- **Archivo**: `agents/architect.md`

### 2. **CoreAPI** (Backend & API Specialist)

- **Role**: Backend y lógica de negocio
- **Responsabilidades**:
  - Implementar Server Actions seguros
  - Integrar webhooks (Stripe, Clerk)
  - Validación estricta con Zod
- **Skills**: Next.js, TypeScript, Zod, Stripe API, Clerk SDK
- **Archivo**: `agents/core-api.md`

### 3. **PixelPerfect** (Frontend & UX/UI Specialist)

- **Role**: Frontend, diseño visual e interactividad
- **Responsabilidades**:
  - Crear componentes reutilizables (shadcn/ui)
  - Asegurar diseño responsive
  - Optimizar Core Web Vitals
- **Skills**: React, Tailwind CSS, Framer Motion, Accessibility
- **Archivo**: `agents/pixel-perfect.md`

### 4. **SchemaKeeper** (Database & Integrity Specialist)

- **Role**: Base de datos y esquema
- **Responsabilidades**:
  - Diseñar y mantener schema.prisma
  - Crear migraciones idempotentes
  - Optimizar índices PostgreSQL
- **Skills**: PostgreSQL v17, SQL Optimization, Prisma Schema
- **Archivo**: `agents/schema-keeper.md`

### 5. **Sentinel** (Security & Compliance Specialist)

- **Role**: Seguridad y cumplimiento
- **Responsabilidades**:
  - Validar políticas RLS
  - Auditar dependencias vulnerables
  - Verificar sanitización de inputs
- **Skills**: OWASP Top 10, GDPR compliance, Auth Flows
- **Archivo**: `agents/sentinel.md`

### 6. **GrowthBot** (SEO & Analytics Specialist)

- **Role**: Visibilidad y posicionamiento
- **Responsabilidades**:
  - Generar metadatos dinámicos
  - Implementar datos estructurados
  - Configurar eventos de conversión
- **Skills**: Technical SEO, Schema.org/JSON-LD, Google Analytics 4
- **Archivo**: `agents/growth-bot.md`

### 7. **BugHunter** (Testing & QA Specialist)

- **Role**: Testing y aseguramiento de calidad
- **Responsabilidades**:
  - Escribir tests unitarios
  - Crear flujos E2E
  - Verificar requisitos fiscales
- **Skills**: Jest, Playwright, E2E Testing
- **Archivo**: `agents/bug-hunter.md`

### 8. **Scribe** (Documentation Specialist)

- **Role**: Documentación y base de conocimiento
- **Responsabilidades**:
  - Mantener README, CHANGELOG y docs/
  - Documentar APIs y flujos de datos
- **Skills**: Technical Writing, Markdown, Mermaid JS
- **Archivo**: `agents/scribe.md`

### 9. **OpsMaster** (Deployment & DevOps Specialist)

- **Role**: CI/CD e infraestructura
- **Responsabilidades**:
  - Configurar pipelines GitHub Actions
  - Gestionar variables de entorno
  - Monitorear salud del servidor
- **Skills**: Docker, GitHub Actions, Easypanel, Vercel/VPS
- **Archivo**: `agents/ops-master.md`

## Cómo Usar los Agentes

Para invocar a un agente específico en el proyecto:

```bash
# Ejemplo: Invocar al Architect para orquestar
claude-code task --agent architect --prompt "Planificar la implementación del scaffold"

# Ejemplo: Invocar a CoreAPI para backend
claude-code task --agent core-api --prompt "Implementar Server Action para crear receta"

# Ejemplo: Invocar a PixelPerfect para frontend
claude-code task --agent pixel-perfect --prompt "Crear componente de búsqueda"
```

## Principios de Diseño de Foodzinder

Todos los agentes deben respetar estos principios:

- **Escalabilidad**: Código preparado para crecer
- **Seguridad**: RLS, validación de datos, cifrado
- **Experiencia de Usuario "Wow"**: Diseño hermoso e intuitivo
- **Mantenibilidad**: Documentación clara, tests completos

## Stack Tecnológico

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion
- **Backend**: Next.js Server Actions, TypeScript
- **Database**: PostgreSQL v17, Prisma ORM
- **Auth**: Clerk
- **Payments**: Stripe
- **Deployment**: Vercel / VPS con Easypanel
- **Testing**: Jest, Playwright
