# ADR-0004: API REST v1 y webhooks salientes firmados como contrato para n8n

- Estado: aceptada
- Fecha: 2026-09-02

## Contexto

El P5 consiste en automatizar procesos del negocio con n8n. Para que eso sea posible sin acoplar n8n a la base de datos, la aplicación necesita dos cosas: una forma de avisar a sistemas externos cuando pasa algo, y una forma de que esos sistemas consulten o actúen sobre los datos.

## Decisión

1. **Webhooks salientes.** Cada evento de dominio se envía por `POST` a las URLs de `WEBHOOK_URLS`, con cuerpo JSON y cabecera `X-Foodzinder-Signature: sha256=<hmac>` calculada con `WEBHOOK_SECRET`. Se reintenta tres veces con espera exponencial y se registra cada intento en `webhook_deliveries`.
2. **API REST bajo `/api/v1`.** Endpoints públicos de solo lectura para el directorio, y endpoints privados autenticados con la cabecera `X-Api-Key` (valor de `FOODZINDER_API_KEY`) para acciones administrativas que n8n necesite ejecutar.
3. **Versionado en la ruta.** Cambios incompatibles irán a `/api/v2`. Los eventos llevan `version: 1` en el cuerpo.

El contrato detallado está en [../api.md](../api.md).

## Consecuencias

Positivas:

- n8n solo necesita una URL de webhook y una clave. No toca la base de datos ni Clerk.
- Los mismos endpoints sirven para tests de contrato, para la presentación con `curl` y para cualquier otro consumidor.
- Los eventos quedan auditados: el admin puede ver en su panel qué se envió y si falló.

Negativas:

- Una clave de API única con permisos de admin es un modelo de seguridad simple. Suficiente para un consumidor de confianza (el propio n8n); no vale para terceros. Se documenta como limitación.
- Los webhooks se envían desde funciones serverless: si la URL destino tarda, se consume tiempo de ejecución. Mitigación: timeout de 5 segundos por intento y reintentos en segundo plano con `after()` de Next.
- Añade una tabla y un módulo más que mantener.
