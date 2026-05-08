AGENTS (Frontend)

Entradas y comandos clave
- Desarrollo local:
  - cd FRONTEND-5TO && npm install
  - cd FRONTEND-5TO && npm run dev
    - Astro dev server (por defecto puerto 4321). Use npm run dev:host para exponer host.
- Build / Preview:
  - cd FRONTEND-5TO && npm run build
  - cd FRONTEND-5TO && npm run preview
  - docs preview (build docs and preview on ephemeral port): npm run docs:preview

Entorno y backend
- FRONTEND-5TO/.env contiene PUBLIC_BACKEND_URL (por defecto: http://localhost:3800/api/v1). Verifica este valor si ejecutas el backend en otro puerto.
- El middleware y servicios del frontend esperan que el backend sirva la API en /api/v1.

Preferencias del equipo (no genéricas)
- Preferir islas dinámicas con React para UI interactiva (Astro + React islands). Hidratación parcial en lugar de hidratar páginas completas.
- Priorizar componentes "primary" del design system para CTAs y formularios principales; si hay duda, elige la variante primary.

Docs
- La documentación del frontend vive en FRONTEND-5TO/src/content/docs/docs/ y se sirve con el comando dev.

Otros
- Cuando trabajes desde el repo root, los scripts del root pueden ejecutar los scripts del workspace. Para cambios locales rápidos preferir ejecutar dentro de FRONTEND-5TO.
