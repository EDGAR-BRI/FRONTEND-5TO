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

## Índice

- [Cliente HTTP del Frontend](api-client/)
