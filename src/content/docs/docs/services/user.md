---
title: User Service
description: CRUD de usuarios (admin) consumiendo /api/v1/auth/user usando api.ts y el patrón envelope.
---

Este service vive en `src/lib/services/User/` y sigue la estructura obligatoria:

- `user.interface.ts`: tipos/DTOs
- `user.service.ts`: llamadas al backend usando `api()`

## Archivos

```
src/lib/services/User/
  user.interface.ts
  user.service.ts
```

## Base path

Este service usa el estándar `BASE_PATH`:

```ts
const BASE_PATH = "/auth/user";
```

## Endpoints que consume

Base URL: ` /api/v1/auth/user `

- `POST /api/v1/auth/user`
- `GET /api/v1/auth/user`
- `GET /api/v1/auth/user/:id`
- `PUT /api/v1/auth/user/:id`
- `DELETE /api/v1/auth/user/:id` (soft delete → `active=false`)

## Funciones disponibles

### `createUser(payload)`

- Input: `CreateUserRequest`
- Return: `Promise<UserDto>`

Crea un usuario y devuelve el `data` tipado del backend.

### `listUsers()`

- Return: `Promise<UserDto[]>`

Lista usuarios. En la implementación actual del backend, normalmente devuelve usuarios activos.

### `getUserById(id)`

- Input: `number`
- Return: `Promise<UserDto>`

Obtiene un usuario por `id`.

### `updateUser(id, payload)`

- Input: `number`, `UpdateUserRequest`
- Return: `Promise<UserDto>`

Actualiza un usuario por `id`.

### `deleteUser(id)`

- Input: `number`
- Return: `Promise<UserDto>`

Elimina lógicamente un usuario (soft delete) marcando `active=false`.

## Patrón envelope y errores

Este service sigue el estándar de services:

- `readEnvelopeData<T>(response)` para extraer `data` cuando el backend responde `{ message, data, error }`.
- `readEnvelopeErrorMessage(response)` para extraer el mensaje de error (con fallback a `Error <status>`).

Ambos helpers viven en:

- `src/lib/services/_shared/envelope.ts`

## Ejemplo de uso (UI)

```ts
import { listUsers, deleteUser } from "@/lib/services/User/user.service";

export async function loadUsers() {
  return listUsers();
}

export async function disableUser(id: number) {
  return deleteUser(id);
}
```
