# Servicios externos: Neon, Clerk y Vercel

Los tres tienen capa gratuita sin tarjeta. Tiempo total estimado: 20 minutos. Los valores se pegan en el fichero `.env` del proyecto (ruta exacta al final).

## 1. Neon (PostgreSQL)

1. Entrar en https://neon.tech y crear cuenta con GitHub.
2. Crear proyecto: nombre `foodzinder`, versión PostgreSQL 17, región `Europe (Frankfurt)`.
3. En el panel del proyecto, botón **Connect**. Copiar dos cadenas:
   - Con **Connection pooling** activado: será `DATABASE_URL`.
   - Con pooling desactivado: será `DIRECT_URL` (la usa Prisma para migraciones).

Ambas empiezan por `postgresql://` y llevan `?sslmode=require`.

## 2. Clerk (autenticación)

1. Entrar en https://clerk.com y crear cuenta.
2. Crear aplicación: nombre `Foodzinder`. Activar **Email** y **Google** como métodos de acceso.
3. En **Configure → API Keys** copiar:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (empieza por `pk_test_`)
   - `CLERK_SECRET_KEY` (empieza por `sk_test_`)
4. En **Configure → Sessions → Customize session token**, añadir este JSON para que el rol viaje en la sesión y el middleware pueda leerlo:
   ```json
   { "publicMetadata": "{{user.public_metadata}}" }
   ```
5. El webhook se configura después del primer despliegue (paso 4), porque necesita la URL pública.

## 3. Fichero `.env` local

Proyecto: **Foodzinder (P4, Sesión 10)**.
Ruta exacta: `C:\Users\liand\Documents\Founder IA\Sesion 10 - Proyecto colaborativo - Directorio de restaurantes\foodzinder-web\.env`

Crear el fichero copiando `.env.example` y rellenar solo estas variables (el resto pueden quedar vacías):

```
DATABASE_URL=postgresql://...          # cadena con pooling de Neon
DIRECT_URL=postgresql://...            # cadena directa de Neon
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=                  # se rellena en el paso 4
NEXT_PUBLIC_APP_URL=http://localhost:3000
WEBHOOK_SECRET=                        # cualquier cadena larga aleatoria
FOODZINDER_API_KEY=                    # cualquier cadena larga aleatoria
WEBHOOK_URLS=                          # vacío hasta el P5
```

Importante: editar el fichero con el editor de texto o con Git Bash. **No usar PowerShell con `>` ni `Out-File`**: escriben UTF-16 con BOM y ni Node ni Prisma lo leen. El fichero está en `.gitignore`; comprobar con `git status` que no aparece.

Para generar las dos cadenas aleatorias, en Git Bash:

```bash
openssl rand -hex 32
```

## 4. Vercel (despliegue)

1. Entrar en https://vercel.com y crear cuenta con GitHub.
2. **Add New → Project**, importar `Rolando-Fonseca/sesi-n-10---Directorio-de-restaurantes---pr-ctica`. En **Settings → Git**, poner `rolando` como **Production Branch** (el repo tiene `main` con el historial del equipo; el proyecto vive en `rolando`).
3. Framework: Next.js (lo detecta solo). `vercel.json` ya fija la región de Londres (junto a Neon), `bun install` y el comando `vercel-build`, que ejecuta las migraciones antes del build. No hace falta tocar nada.
4. **Environment Variables**: pegar las mismas del `.env` cambiando `NEXT_PUBLIC_APP_URL` por la URL que asigne Vercel (por ejemplo `https://foodzinder.vercel.app`). Imprescindibles: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `FOODZINDER_API_KEY`, `WEBHOOK_SECRET`. `WEBHOOK_URLS` se rellena en el P5 (o con un `webhook.site` para la demo).
5. Deploy. Copiar la URL final.

### CI en GitHub Actions

El workflow `.github/workflows/ci.yml` corre lint, tipos, migraciones y seed sobre un PostgreSQL efímero, los 68 tests y el build. Para que el build funcione en CI hay que añadir dos secrets en **GitHub → Settings → Secrets and variables → Actions**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` (las mismas claves de desarrollo). Sin ellos, el workflow lo avisa y omite solo el paso de build.

## 5. Webhook de Clerk (después del primer despliegue)

1. En Clerk, **Configure → Webhooks → Add Endpoint**.
2. URL: `https://<url-de-vercel>/api/webhooks/clerk`.
3. Eventos: `user.created`, `user.updated`, `user.deleted`.
4. Copiar el **Signing Secret** (empieza por `whsec_`) y ponerlo como `CLERK_WEBHOOK_SECRET` en Vercel (y en el `.env` local). Redesplegar.

## 6. Primer administrador

Tras registrarse en la demo con el correo que vaya a ser admin, en Clerk **Users → (usuario) → Metadata → Public** poner:

```json
{ "role": "ADMIN" }
```

El webhook `user.updated` copia el rol a la base de datos. A partir de ahí, los demás roles se gestionan desde el panel de admin de la propia aplicación.
