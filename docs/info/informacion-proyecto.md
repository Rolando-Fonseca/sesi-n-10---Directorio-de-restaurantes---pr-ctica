# 🍴 Proyecto: Foodzinder

**Descripción:** Directorio especializado de restaurantes con sistema de suscripción, geolocalización y gamificación.

## 🎨 Identidad Visual y UI

* **Nombre:** Foodzinder
* **Color Primario:** `#f67499` (Rosa vibrante)
* **Paleta de Colores Sugerida (Contraste AA/AAA):**
| Uso              | Hexadecimal | Vista Previa |
| :--------------- | :---------- | :----------- |
| **Primario**     | `#f67499`   |              |
| **Secundario**   | `#2D3436`   |              |
| **Acento**       | `#FFC107`   |              |
| **Fondo Neutro** | `#F9FAFB`   |              |
* **Recursos:** * Logo: Disponibles en `/assets` (versiones `color` y `white`).
* **Componentes UI:** Biblioteca centralizada de componentes reutilizables.



---

## 👥 Roles de Usuario

1. **Administrador:** Control total del sistema, aprobación de comercios y gestión de taxonomías globales.
2. **Owner (Dueño):** Gestión de sus propios restaurantes y menús mediante suscripción.
3. **Usuario (Consumidor):** Búsqueda de restaurantes, sistema de deseos y reseñas.
4. **Visitante:** Consulta pública limitada.

---

## 🚀 Funcionalidades Principales

### 💳 Suscripciones y Pagos

* Modelo de suscripción mensual o anual para **Owners**.
* Sistema de cupones de descuento aplicables a las suscripciones.

### 🏠 Gestión de Restaurantes y Menús

* **Flujo de Aprobación:** El Owner crea el restaurante; el Admin debe aprobarlo.
* **Asignación Flexible:** * Los menús pueden pertenecer a uno o más restaurantes del mismo owner.
* El Admin puede crear y asignar contenido a cualquier usuario.


* **Localización Avanzada:** * Integración con **OpenStreetMap**.
* Cálculo de distancia y tiempo de llegada en tiempo real.
* Mapa interactivo con slider dinámico (estilo *TheFork*).



### 🔍 Experiencia del Usuario (UX)

* **Dashboard Personalizado:** Configuración de preferencias (taxonomías) y gestión de **Alergias** para filtrado automático de platos.
* **Sistema de Deseos:** Guardado de platos en un sidebar lateral (tipo carrito) con cálculo de precio total por restaurante.
* **Filtros Inteligentes:** Buscador con conteos dinámicos basados en ubicación y atributos.

### ⭐️ Opiniones y Gamificación

* **Reseñas Multicriterio:** Valoración de Ambiente, Servicio, Comida y Calidad/Precio.
* **Multimedia:** Posibilidad de subir imágenes en las reseñas.
* **Gamificación:** Sistema de recompensas/puntos para usuarios activos.

---

## 🛠 Especificaciones Técnicas

### 🏷 Taxonomías (Categorización)

| Entidad             | Taxonomía                                                                                                            | Gestión                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **Restaurantes**    | Precio (€, €€, €€€), Tipo de establecimiento, Características, Comidas, Preferencias ("Soy más de"), Tipo de cocina. | **Solo Admin** (Owners solo seleccionan). |
| **Menús**           | Presentación (Ración, Tapa, etc.), Alérgenos.                                                                        | **Solo Admin**.                           |
| **Categorías Menú** | Categorías de platos.                                                                                                | **Owner** (Uso local por restaurante).    |

### 📈 Marketing y Analítica

* **SEO:** Optimización completa para fichas de restaurantes y páginas estáticas. (Excluye platos y páginas legales).
* **Herramientas:** Google Tag Manager y Microsoft Clarity.
* **Legal:** Sistema de cookies adaptado a normativas Europeas e internacionales.

### 🔔 Notificaciones

* Alertas automáticas al Administrador ante:
* Nuevos registros de usuarios.
* Creación de nuevos restaurantes o platos.



---

## 📝 Pendientes de Definición

* [ ] Estructura detallada de campos para la tabla `Usuarios`.
* [ ] Estructura detallada de campos para la tabla `Restaurantes`.
* [ ] Estructura detallada de campos para la tabla `Menus`.
* [ ] Atributos técnicos para las `Taxonomías`.

---

**¿Te gustaría que te ayude a diseñar la estructura de base de datos para los campos que quedaron pendientes?**
