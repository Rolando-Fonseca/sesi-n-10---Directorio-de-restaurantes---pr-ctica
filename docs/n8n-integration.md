# Puente al P5: automatizaciones con n8n

Este documento resume lo que Foodzinder ofrece a n8n y propone los cinco flujos del P5. El contrato completo está en [api.md](api.md).

## Qué entrega Foodzinder

| Mecanismo | Configuración | Para qué |
|-----------|---------------|----------|
| Webhooks salientes firmados | `WEBHOOK_URLS` (lista), `WEBHOOK_SECRET` | Reaccionar en tiempo real a altas, aprobaciones, rechazos, reseñas y suscripciones |
| API privada | cabecera `X-Api-Key` = `FOODZINDER_API_KEY` | Consultar la cola de aprobación, aprobar o rechazar, leer reseñas desde una fecha, estadísticas, auditar entregas |
| API pública | sin clave | Datos del directorio para informes o publicaciones |

Verificación de la firma en un nodo Code de n8n (antes de cualquier otro paso):

```js
const crypto = require('crypto');
const raw = $input.item.binary?.data ? Buffer.from($input.item.binary.data.data, 'base64').toString() : JSON.stringify($input.item.json.body);
const expected = 'sha256=' + crypto.createHmac('sha256', $env.FOODZINDER_WEBHOOK_SECRET).update(raw).digest('hex');
if (expected !== $input.item.json.headers['x-foodzinder-signature']) throw new Error('Firma inválida');
return $input.item;
```

En el nodo Webhook de n8n activar **Raw Body** para que el cuerpo firmado sea byte a byte el que envió Foodzinder.

## Flujos propuestos para el P5

1. **Aprobación asistida.** `restaurant.created` → resumen de la ficha con IA (nombre, cocina, dirección, si tiene carta) → mensaje a Telegram o correo al admin con dos botones → n8n llama a `POST /admin/restaurants/{id}/approve` o `/reject` con el motivo escrito en la respuesta.
2. **Bienvenida al dueño.** `restaurant.approved` → correo al dueño con la URL pública, un QR de la ficha y consejos para completar la carta.
3. **Alerta de reseña negativa.** `review.created` con `average < 3` → IA redacta un borrador de respuesta empática → correo al dueño con el borrador y el enlace a la ficha.
4. **Informe semanal.** Cron lunes 8:00 → `GET /admin/stats?period=7d` y `GET /admin/reviews?since=` → IA escribe tres párrafos con lo relevante → correo al admin con cifras y enlace al panel.
5. **Mantener la demo despierta.** Cron cada 10 minutos en horario de presentación → `GET /restaurants?limit=1` para evitar el arranque en frío de Neon y Vercel.

## Lo que n8n no necesita

- Acceso a la base de datos ni a Clerk: todo pasa por eventos y API.
- Reintentar por su cuenta: Foodzinder reintenta tres veces y registra cada intento; n8n solo debe responder 2xx rápido y procesar después.

## Primer paso sugerido

Antes de montar nada, apuntar `WEBHOOK_URLS` a un `webhook.site`, pulsar «Enviar evento de prueba» en `/dashboard/admin/webhooks` y comprobar que llega el cuerpo con las tres cabeceras. Después, sustituir la URL por la del nodo Webhook de n8n.
