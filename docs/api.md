# API v1 y webhooks salientes

Contrato que consumirá n8n en el P5. Todo bajo `/api/v1`. Respuestas en JSON con la envoltura:

```json
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 20, "total": 57 } }
{ "success": false, "error": "Mensaje legible", "code": "NOT_FOUND" }
```

Códigos: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `RATE_LIMITED` (429), `INTERNAL` (500).

## Endpoints públicos (sin autenticación, solo lectura)

Devuelven únicamente restaurantes `APPROVED` y activos. Límite: 60 peticiones por minuto e IP.

| Método y ruta | Parámetros | Devuelve |
|---------------|-----------|----------|
| `GET /restaurants` | `query`, `city`, `cuisine` (slug, repetible), `feature` (slug, repetible), `price` (`CHEAP`, `MODERATE`, `EXPENSIVE`, `LUXURY`, repetible), `lat`, `lng`, `radius` (km, por defecto 10), `page`, `limit` (máx. 50), `sort` (`rating`, `distance`, `recent`) | Lista de `RestaurantSummary` con `distanceKm` si hay coordenadas |
| `GET /restaurants/{slug}` | | `RestaurantDetail`: ficha, taxonomías, menús con categorías y platos, alérgenos por plato, resumen de valoraciones |
| `GET /restaurants/{slug}/reviews` | `page`, `limit` | Reseñas con sus cuatro puntuaciones y autor (nombre e imagen) |
| `GET /taxonomies` | `scope` (obligatorio) | Taxonomías activas del scope, ordenadas |
| `GET /plans` | | Planes activos con precios y límites |

### Tipos

```ts
type RestaurantSummary = {
  id: string; slug: string; name: string; city: string | null;
  priceRange: "CHEAP" | "MODERATE" | "EXPENSIVE" | "LUXURY" | null;
  averageRating: number; reviewCount: number;
  coverUrl: string | null; latitude: number; longitude: number;
  cuisines: { slug: string; name: string }[];
  distanceKm?: number;
};

type RestaurantDetail = RestaurantSummary & {
  description: string | null; address: string; postalCode: string | null;
  phone: string | null; website: string | null; logoUrl: string | null;
  features: { slug: string; name: string }[];
  ratingBreakdown: { AMBIANCE: number; SERVICE: number; FOOD: number; VALUE: number };
  menus: {
    id: string; title: string; price: number | null;
    categories: { id: string; name: string; dishes: Dish[] }[];
  }[];
};

type Dish = {
  id: string; name: string; description: string | null; price: number;
  imageUrl: string | null; isAvailable: boolean; isFeatured: boolean;
  presentation: string | null;
  allergens: { slug: string; name: string }[];
};
```

## Endpoints privados (cabecera `X-Api-Key`)

Pensados para n8n. La clave es `FOODZINDER_API_KEY` y equivale al rol `ADMIN`. Límite: 120 peticiones por minuto.

| Método y ruta | Cuerpo | Efecto |
|---------------|--------|--------|
| `GET /admin/restaurants?status=PENDING` | | Restaurantes por estado, con datos del owner |
| `POST /admin/restaurants/{id}/approve` | | Pasa a `APPROVED`. Emite `restaurant.approved` |
| `POST /admin/restaurants/{id}/reject` | `{ "reason": "..." }` | Pasa a `REJECTED`. Emite `restaurant.rejected` |
| `GET /admin/reviews?since=ISO` | | Reseñas creadas desde la fecha (para resúmenes) |
| `GET /admin/stats?period=7d` | | Contadores: altas de usuarios y owners, restaurantes por estado, reseñas, media global |
| `GET /admin/webhook-deliveries?status=FAILED` | | Entregas de webhook y su resultado |
| `POST /admin/webhook-deliveries/{id}/retry` | | Reintenta una entrega |

## Webhooks salientes

Configuración: `WEBHOOK_URLS` (lista separada por comas) y `WEBHOOK_SECRET`.

Cabeceras de cada `POST`:

```
Content-Type: application/json
X-Foodzinder-Event: restaurant.created
X-Foodzinder-Delivery: <uuid>
X-Foodzinder-Signature: sha256=<HMAC-SHA256 del cuerpo con WEBHOOK_SECRET>
```

Cuerpo:

```json
{
  "id": "uuid de la entrega",
  "event": "restaurant.created",
  "version": 1,
  "occurredAt": "2026-09-02T10:15:00.000Z",
  "data": {}
}
```

| Evento | Cuándo | `data` |
|--------|--------|--------|
| `user.created` | Un usuario nuevo se sincroniza desde Clerk | `{ id, email, firstName, lastName, role }` |
| `user.became_owner` | Un usuario pasa a `OWNER` | `{ id, email, firstName, lastName }` |
| `restaurant.created` | Un owner crea un restaurante (queda `PENDING`) | `RestaurantSummary` + `{ owner: { id, email, name }, status }` |
| `restaurant.resubmitted` | Un owner reenvía uno rechazado | igual que `restaurant.created` |
| `restaurant.approved` | El admin aprueba | `RestaurantSummary` + `{ owner, publicUrl }` |
| `restaurant.rejected` | El admin rechaza | `RestaurantSummary` + `{ owner, reason }` |
| `menu.created` | Un owner crea una carta | `{ id, title, ownerId, restaurantIds }` |
| `review.created` | Un usuario publica una reseña | `{ id, restaurant: { id, slug, name, ownerEmail }, author: { id, name }, ratings, comment, average }` |
| `subscription.activated` | Un owner activa un plan (simulado) | `{ id, userId, plan, interval, amount, currentPeriodEnd }` |

Reintentos: 3 intentos con esperas de 2, 8 y 30 segundos. Timeout 5 segundos por intento. Se considera entregado con cualquier respuesta 2xx.

Verificación en n8n (nodo Code, antes de procesar):

```js
const crypto = require('crypto');
const body = JSON.stringify($input.item.json.body);
const expected = 'sha256=' + crypto.createHmac('sha256', $env.FOODZINDER_WEBHOOK_SECRET).update(body).digest('hex');
if (expected !== $input.item.json.headers['x-foodzinder-signature']) throw new Error('Firma inválida');
return $input.item;
```

## Cabeceras y límites

Todas las respuestas llevan `Cache-Control: no-store` y las cabeceras `X-RateLimit-Limit`, `X-RateLimit-Remaining` y `X-RateLimit-Reset` (segundos). Al superar el límite se responde `429` con `Retry-After` y `code: "RATE_LIMITED"`. El límite es por IP y ventana deslizante de un minuto, en memoria (ADR-0003).

`GET /api/v1` devuelve un índice con los endpoints, la ruta a este documento y la lista de eventos.

## Ejemplos con curl

```bash
BASE=https://<tu-dominio>/api/v1
KEY=<FOODZINDER_API_KEY>

# Público
curl "$BASE/restaurants?query=paella&city=Valencia"
curl "$BASE/restaurants?lat=40.4169&lng=-3.7035&radius=3&sort=distance"
curl "$BASE/restaurants/casa-terral"
curl "$BASE/restaurants/casa-terral/reviews?limit=5"
curl "$BASE/taxonomies?scope=MENU_ALLERGEN"
curl "$BASE/plans"

# Privado (n8n)
curl -H "X-Api-Key: $KEY" "$BASE/admin/restaurants?status=PENDING"
curl -H "X-Api-Key: $KEY" -X POST "$BASE/admin/restaurants/<id>/approve"
curl -H "X-Api-Key: $KEY" -X POST -H "content-type: application/json" -d '{"reason":"La dirección no coincide con las fotos"}' "$BASE/admin/restaurants/<id>/reject"
curl -H "X-Api-Key: $KEY" "$BASE/admin/reviews?since=2026-09-01T00:00:00Z"
curl -H "X-Api-Key: $KEY" "$BASE/admin/stats?period=7d"
curl -H "X-Api-Key: $KEY" "$BASE/admin/webhook-deliveries?status=FAILED"
curl -H "X-Api-Key: $KEY" -X POST "$BASE/admin/webhook-deliveries/<id>/retry"
curl -H "X-Api-Key: $KEY" -X POST -H "content-type: application/json" -d '{"message":"prueba"}' "$BASE/admin/webhooks/test"
```

Las operaciones administrativas hechas con clave de API se atribuyen al primer administrador de la base de datos, para que las transiciones queden firmadas por una persona real.

## Tests de contrato

`src/test/api-contract.test.ts` ejecuta cada endpoint contra la base de datos del `.env` con los datos del seed: envoltura, códigos de estado, cabeceras de límite, 401 sin clave, 400 de validación, 404, 409 en transiciones inválidas y el flujo rechazar y aprobar sobre un restaurante de prueba que se crea y se borra en el propio test.

## Casos de uso previstos para el P5

1. `restaurant.created` → n8n avisa al admin por correo o Telegram con un botón de aprobar que llama a `POST /admin/restaurants/{id}/approve`.
2. `restaurant.approved` → correo al owner con la URL pública de su ficha.
3. `review.created` con media menor de 3 → aviso al owner y resumen de la queja generado con IA.
4. Cron semanal → `GET /admin/stats?period=7d` y `GET /admin/reviews?since=` → informe con resumen generado por IA enviado al admin.
5. Cron cada 10 minutos → `GET /restaurants?limit=1` para evitar el arranque en frío de Neon y Vercel antes de una demo.
