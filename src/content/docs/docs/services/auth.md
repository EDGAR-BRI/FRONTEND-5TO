---
title: Auth Service
description: Service de autenticación (login, registro, roles) usando api.ts.
---

Este service vive en `src/lib/services/auth/` y sigue la estructura obligatoria:

- `auth.interface.ts`: tipos/DTOs
- `auth.service.ts`: llamadas al backend usando `api()`

## Archivos

```
src/lib/services/auth/
  auth.interface.ts
  auth.service.ts
```

## Endpoints que consume

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/role`
- `POST /api/v1/auth/register`

## Funciones disponibles

### `loginWithCredentials(payload)`

- Input: `LoginRequest`
- Return: `Promise<LoginResponseData>`

Hace login, y retorna `{ user, token }` desde el envelope del backend.

### `persistLogin(data)`

- Input: `LoginResponseData`
- Side effects: guarda cookies (`auth_token`, `auth_user_name`)

Uso típico: después de un login exitoso.

### `registerUser(payload)`

- Input: `RegisterUserRequest`
- Return: `Promise<RegisterUserResponseData>`

Este service crea un usuario (signup) usando `POST /auth/register`.

Nota: el recurso `POST /auth/user` queda para casos administrativos/CRUD de usuarios.

Nota: el service devuelve el tipo del `data` del backend (no `any`).

### `listRoles()`

- Return: `Promise<Role[]>`

Lista roles disponibles.

### Helpers UI

Estas funciones no llaman al backend, pero ayudan a la UI:

- `resolveRoleCode(user)`
- `dashboardPathForUser(user, roleCodeOverride?)`

## Patrón envelope

Este service usa `readEnvelopeData<T>()` desde `src/lib/services/_shared/envelope.ts` para extraer `data` cuando el backend responde un envelope `{ message, data, error }`.

## Ejemplo de uso (UI)

```ts
import { loginWithCredentials, persistLogin } from "@/lib/services/auth/auth.service";

export async function doLogin(ci: string, password: string) {
  const data = await loginWithCredentials({ ci, password });
  persistLogin(data);
  return data.user;
}
```
