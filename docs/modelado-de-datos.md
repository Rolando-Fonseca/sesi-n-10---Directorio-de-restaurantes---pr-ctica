# 🗄 Modelo de Datos: Foodzinder

Propuesta de esquema de base de datos relacional (PostgreSQL).

## Diagrama E-R Simplificado (Conceptos)

- **User** 1:N **Restaurant** (Owner)
- **Restaurant** 1:N **Review**
- **User** 1:N **Review**
- **Restaurant** N:M **Menu** (Un menú puede usarse en varios restaurantes del mismo dueño)
- **Menu** 1:N **Dish** (Platos)
- **Restaurant** N:M **Taxonomy** (Categorías, Etiquetas)

## Definición de Entidades

### 👤 User (Extendiendo Clerk)

Esta tabla sincroniza datos críticos para integridad referencial.

- `id`: String (Clerk ID, PK)
- `email`: String (Unique)
- `firstName`: String
- `lastName`: String
- `role`: Enum (ADMIN, OWNER, USER)
- `taxId`: String (NIF/CIF - Opcional, requerido para facturar)
- `billingName`: String (Razón Social - Opcional)
- `billingAddress`: String (Opcional)
- `createdAt`: DateTime

### 🏪 Restaurant

- `id`: UUID (PK)
- `ownerId`: String (FK -> User.id)
- `name`: String
- `slug`: String (Unique, para URL amigables)
- `description`: Text
- `address`: String
- `latitude`: Float
- `longitude`: Float
- `status`: Enum (PENDING, APPROVED, REJECTED, ARCHIVED)
- `logoUrl`: String
- `coverUrl`: String
- `priceRange`: Enum (CHEAP, MODERATE, EXPENSIVE, LUXURY)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### 📜 Menu

Los menús se crean independientemente y se asignan a restaurantes.

- `id`: UUID (PK)
- `ownerId`: String (FK -> User.id) - Para asegurar que solo el dueño lo edite.
- `title`: String (ej: "Menú Fin de Semana")
- `description`: Text
- `price`: Decimal (Opcional, si es precio fijo)
- `isActive`: Boolean

### 🔗 RestaurantMenu (Pivot)

Relación Muchos a Muchos entre Restaurantes y Menús.

- `restaurantId`: UUID (FK)
- `menuId`: UUID (FK)
- `assignedAt`: DateTime

### 🍲 Dish (Plato)

Items dentro de un menú.

- `id`: UUID (PK)
- `menuId`: UUID (FK -> Menu.id)
- `name`: String
- `description`: Text
- `price`: Decimal
- `imageUrl`: String
- `allergens`: String[] (Array de strings o relación a tabla Allergens)
- `order`: Integer (Para ordenar en la vista)

### 🏷 Taxonomy (Categorías/Etiquetas)

Tabla centralizada para todo tipo de etiquetas gestionadas por Admin.

- `id`: UUID (PK)
- `type`: Enum (CUISINE_TYPE, RESTAURANT_FEATURE, DIETARY, AMBIANCE)
- `name`: String
- `slug`: String

### 🔗 RestaurantTaxonomy (Pivot)

- `restaurantId`: UUID (FK)
- `taxonomyId`: UUID (FK)

### ⭐ Review

- `id`: UUID (PK)
- `restaurantId`: UUID (FK)
- `userId`: UUID (FK)
- `rating`: Integer (1-5)
- `comment`: Text
- `photos`: String[] (URLs)
- `createdAt`: DateTime

### 💳 Subscription

- `id`: UUID (PK)
- `userId`: String (FK -> User.id, el Owner)
- `startDate`: DateTime
- `endDate`: DateTime
- `status`: Enum (ACTIVE, PAST_DUE, CANCELED)
- `planId`: String (Stripe Plan ID)
- `amount`: Decimal (Precio final con IVA)
- `currency`: String (Default: 'EUR')

### 🧾 Invoice

Tabla para cumplimiento fiscal en España.

- `id`: UUID (PK)
- `subscriptionId`: UUID (FK)
- `userId`: String (FK -> User.id)
- `number`: String (Secuencial unico, ej: 'INV-2025-001')
- `amountSubtotal`: Decimal (Base imponible)
- `taxAmount`: Decimal (Cuota de IVA)
- `taxRate`: Decimal (Porcentaje IVA, ej: 21.00)
- `total`: Decimal (Total a pagar)
- `status`: Enum (PAID, VOID, REFUNDED)
- `issuedAt`: DateTime
- `pdfUrl`: String (Enlace a factura generada)
