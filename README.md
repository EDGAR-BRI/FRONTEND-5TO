# FRONTEND-5TO

Frontend del proyecto (Astro + React) con documentación en Starlight.

## Requisitos

- Node.js (recomendado: LTS)

## Instalación

Importante: este workspace tiene múltiples carpetas (`BACKEND-5TO` y `FRONTEND-5TO`).
Los comandos de npm deben ejecutarse dentro de cada carpeta.

```sh
cd FRONTEND-5TO
npm install
```

## Desarrollo

```sh
cd FRONTEND-5TO
npm run dev
```

Por defecto corre en `http://localhost:4321` (o el puerto que indique Astro).

## Build / Preview

```sh
cd FRONTEND-5TO
npm run build
npm run preview
```

## Documentación

- La doc vive en `src/content/docs/docs/`.
- El sitio de docs se sirve con el mismo `npm run dev`.
