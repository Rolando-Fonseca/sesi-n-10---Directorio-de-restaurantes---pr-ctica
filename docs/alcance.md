# 🎯 Alcance del Proyecto (Scope): Foodzinder

Este documento define las funcionalidades incluidas en el Producto Mínimo Viable (MVP) y las que se posponen para versiones futuras.

## ✅ MVP (Producto Mínimo Viable)

El objetivo del MVP es lanzar una plataforma funcional donde los dueños puedan publicar restaurantes y los usuarios puedan buscarlos y valorarlos.

### 1. Gestión de Usuarios y Roles

- **Registro/Login:** Email, Social Login (Google) mediante Clerk.
- **Roles:**
  - **Admin:** Acceso a panel global.
  - **Owner:** Registro y acceso a panel de gestión de restaurantes.
  - **Usuario:** Perfil básico, favoritos.

### 2. Gestión de Restaurantes (Owners)

- **Creación de Perfil:** Nombre, Descripción, Dirección (con mapa), Fotos, Horarios.
- **Estado:** Pendiente de aprobación / Aprobado / Rechazado.
- **Taxonomías:** Asignación de categorías predefinidas (ej: "Italiana", "Romántico").

### 3. Gestión de Menús (Owners)

- **Creación de Menús:** Título, Descripción, Precio.
- **Items del Menú:** Nombre, Foto, Precio, Alérgenos.
- **Asignación:** Vincular un menú a uno o varios restaurantes propios.

### 4. Admin Panel

- **Aprobación:** Listado de restaurantes pendientes para aprobar/rechazar.
- **Taxonomías:** CRUD de categorías, tipos de cocina, alérgenos.

### 5. Experiencia de Usuario (Público)

- **Buscador:** Búsqueda por texto (nombre, plato) y filtros (categoría, precio).
- **Geolocalización:** "Restaurantes cerca de mí".
- **Ficha de Restaurante:** Info completa, mapa, menús, fotos.
- **Reseñas:** Dejar valoración (1-5 estrellas) y comentario texto.

### 6. Pagos y Facturación (España)

- **Moneda:** Euro (€) exclusivamente. Precios mostrados con IVA incluido.
- **Suscripción Owner:** Integración con Stripe para gestionar pagos recurrentes y facturación automática.
- **Facturación:** Generación de facturas simplificadas y completas adaptadas a normativa española (IVA desglosado, datos fiscales de la empresa y del cliente).
- **Gestión Fiscal:** Registro de datos de facturación para Owners (NIF/CIF, Razón Social, Dirección).

---

## 🔮 Futuras Versiones (V2 / Post-MVP)

- **Gamificación Avanzada:** Niveles de usuario, insignias, rewards por reseñas constantes.
- **Sistema de Reservas:** Integración con calendario para reservar mesa directamente.
- **Pedidos/Delivery:** Pasarela de pagos para pedir comida (fuera del alcance inicial de "Directorio").
- **Analítica Profunda para Owners:** Dashboards complejos de visualizaciones, heatmap de clics.
- **Chat:** Comunicación directa Usuario-Restaurante.
- **Traducción Multi-idioma:** i18n completo.
