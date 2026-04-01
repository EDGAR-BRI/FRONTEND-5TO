---
title: Services
description: Servicios y helpers del frontend (clientes HTTP, fetchers, auth, etc.).
---

Esta sección agrupa documentación de los **servicios** del frontend (capa de acceso a datos y utilidades).

## Regla de oro

Para hacer peticiones HTTP al backend desde el frontend:

- **No** uses `fetch()` directo en componentes React/Astro.
- **No** llames endpoints desde la UI sin pasar por un service.
- **Sí**: crea un service en `src/lib/services/` y dentro usa el cliente HTTP `src/lib/api.ts` (en runtime es `api.js`).

### Flujo recomendado

1. UI (componentes/páginas) llama una función del service.
2. El service usa `api()` de `src/lib/api.ts` para hablar con el backend.
3. La UI consume el resultado (data/errores) del service.

Beneficios:

- Un solo lugar para headers, token y redirección en `401`.
- Código más fácil de testear y reutilizar.
- Evita duplicar URLs y lógica de errores en componentes.

## Estructura obligatoria de un service

Cada service vive en una **subcarpeta** dentro de `src/lib/services/` y debe incluir:

- `*.service.ts`: funciones que hacen las peticiones (usando `api.ts` / `api.js`).
- `*.interface.ts`: tipos/DTOs del módulo (requests, responses, modelos).

Regla: las funciones del service deben declarar y devolver su **tipo de respuesta** (definido en el `*.interface.ts`).
Evita `any`.

Recomendación:

- El service debe devolver **datos tipados** (por ejemplo `Promise<UserDto>` o `Promise<LoginResponseData>`), no `Response`.
- Si un endpoint devuelve un envelope, el service retorna el tipo de `data` (no el envelope completo).

Ejemplo real (Auth):

```
src/lib/services/auth/
	auth.service.ts
	auth.interface.ts
```

### Ejemplo: Auth usando `api.ts` (api.js)

El archivo `auth.service.ts` importa `api()` y centraliza el manejo de errores y el parseo del envelope:

```ts
import { api } from "@/lib/api";
import type { LoginRequest, LoginResponseData } from "./auth.interface";

export const loginWithCredentials = async (
	payload: LoginRequest
): Promise<LoginResponseData> => {
	const response = await api("/auth/login", {
		method: "POST",
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error(`Error ${response.status}: ${response.statusText}`);
	}

	const json = await response.json();
	return (json && typeof json === "object" && "data" in json)
		? (json.data as LoginResponseData)
		: (json as LoginResponseData);
};
```

Regla: la UI (componentes) debe importar `loginWithCredentials()` desde el service, **no** llamar `api()` o `fetch()` directamente.

Ejemplo de tipado (registro):

- `registerUser(payload): Promise<RegisterUserResponseData>`
- `RegisterUserResponseData` vive en `auth.interface.ts` y representa el `data` del backend.

## Patrón estándar: `readEnvelopeData` (envelope del backend)

Muchos endpoints del backend responden un envelope como:

```json
{ "message": "...", "data": {}, "error": "..." }
```

Para mantener los services consistentes, usa un helper para extraer `data` cuando exista.
Este patrón ya está implementado en `src/lib/services/_shared/envelope.ts` y se usa en `src/lib/services/auth/auth.service.ts`.

Implementación recomendada:

```ts
const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null;
};

export const readEnvelopeData = async <T,>(response: Response): Promise<T> => {
	const json: unknown = await response.json();
	if (isRecord(json) && "data" in json) return (json as { data: T }).data;
	return json as T;
};
```

Uso dentro de un service:

```ts
import { api } from "@/lib/api";
import { readEnvelopeData } from "@/lib/services/_shared/envelope";
import type { LoginRequest, LoginResponseData } from "./auth.interface";

export async function loginWithCredentials(
	payload: LoginRequest
): Promise<LoginResponseData> {
	const response = await api("/auth/login", {
		method: "POST",
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		let message = `Error ${response.status}: ${response.statusText}`;
		try {
			const json = (await response.json()) as any;
			message = json?.message || json?.error || json?.data?.message || message;
		} catch {
			// ignore
		}
		throw new Error(message);
	}

	return readEnvelopeData<LoginResponseData>(response);
}
```

Recomendación práctica:

- Si el helper lo usas en múltiples módulos, colócalo como util compartida (por ejemplo en `src/lib/services/_shared/`).
- Si solo aplica a un módulo, mantenlo dentro de su subcarpeta.

## Índice

- [Cliente HTTP del Frontend](api-client/)
- [Auth Service](auth/)
