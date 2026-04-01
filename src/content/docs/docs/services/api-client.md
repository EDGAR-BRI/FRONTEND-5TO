---
title: Cliente HTTP del Frontend
---

Esta página documenta el helper `src/lib/api.ts` que centraliza:

- Resolución de la URL del backend (`PUBLIC_BACKEND_URL`).
- Manejo del token JWT vía cookies del frontend.
- Wrapper `api()` para `fetch()` con headers estándar y comportamiento en `401`.

> Importante: este cliente HTTP es la base para construir **services**.
> La UI (componentes/páginas) debería consumir **services** y no hablar con el backend directamente.

## Advertencia (cómo se deben crear los services)

- Crea tus services en `src/lib/services/`.
- Dentro del service usa `api()` desde `src/lib/api.ts` (compila a `api.js`).
- En el frontend (React/Astro) importa y usa el service; evita hacer `fetch()` directo.

## Configuración de URL (sin mocks)

El frontend **no** usa endpoints locales de Astro como mocks. Todas las llamadas deben ir al backend real.

- Variable: `PUBLIC_BACKEND_URL`
- Ejemplo (desarrollo local): `http://localhost:3800/api/v1`

Comportamiento:

- Si `PUBLIC_BACKEND_URL` está definida, se usa tal cual.
- Si NO está definida:
  - En `DEV` usa por defecto `http://localhost:3800/api/v1`.
  - En `PROD` lanza error para forzar la configuración explícita.

### Acceso desde otra PC (hostname re-write)

Si abres el frontend desde otra PC en la red (ej. `http://192.168.x.y:4321`) y `PUBLIC_BACKEND_URL` apunta a `localhost`, el helper reescribe el host a `window.location.hostname`.

Esto evita el problema típico: en la PC cliente, `localhost` apunta a la PC cliente, no al servidor.

## Cookies y autenticación

El token se guarda en cookies del **frontend** (no del backend):

- `auth_token`: JWT
- `auth_user_name`: nombre del usuario (display)

Funciones principales:

- `setToken(token)`
- `getToken(cookies?)`
- `removeToken()` (también borra `auth_user_name`)
- `setUserName(name)`, `getUserName(cookies?)`, `removeUserName()`

Detalles:

- En navegador usa `js-cookie`.
- En SSR (Astro) puedes pasar `Astro.cookies` a `getToken()` / `api()` para leer la cookie del request.
- La cookie se escribe con:
  - `sameSite: "lax"`
  - `secure: import.meta.env.PROD`

## Wrapper `api(endpoint, options, cookies?)`

Firma:

```ts
api(endpoint: string, options: RequestInit = {}, cookies?: AstroCookies): Promise<Response>
```

Qué hace:

- Agrega `Content-Type: application/json` por defecto.
- Si existe token, agrega `Authorization: Bearer <token>`.
- Normaliza `endpoint` para que siempre empiece con `/`.
- Ejecuta `fetch(`${API_URL}${cleanEndpoint}`, config)`.

### Manejo de 401

Si el backend responde `401`:

- En navegador:
  - Borra token (`removeToken()`).
  - Redirige a `/login`.
- En SSR:
  - Lanza `Error("Unauthorized")` (para que el caller lo maneje).

Nota: para otros status codes (400/404/500), `api()` **no** lanza error; devuelve el `Response` y el caller decide.

## Ejemplos de uso

### Ejemplo recomendado: crear un service y usarlo en la UI

Service (ejemplo):

```ts
// src/lib/services/finance/invoices.service.ts
import { api } from "@/lib/api";

export async function listInvoices() {
  const res = await api("/finance/invoices", { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load invoices (${res.status}): ${text}`);
  }
  return res.json();
}
```

Uso en React (ejemplo):

```ts
import { listInvoices } from "@/lib/services/finance/invoices.service";

export async function loadInvoices() {
  return listInvoices();
}
```

### SSR (Astro): pasar cookies al service

Service (ejemplo):

```ts
// src/lib/services/auth/me.service.ts
import type { AstroCookies } from "astro";
import { api } from "@/lib/api";

export async function getMe(cookies?: AstroCookies) {
  const res = await api("/auth/login/me", { method: "GET" }, cookies);
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}
```

Uso en una página Astro (ejemplo):

```astro
---
import { getMe } from "@/lib/services/auth/me.service";

const me = await getMe(Astro.cookies);
---
```

## Troubleshooting

- Error: `Missing PUBLIC_BACKEND_URL ...`
  - En producción debes definir `PUBLIC_BACKEND_URL`.
  - En desarrollo, si necesitas apuntar a otra URL (túnel/IP/https), define `PUBLIC_BACKEND_URL` en `FRONTEND-5TO/.env`.
