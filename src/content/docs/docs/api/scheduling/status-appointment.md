---
title: Estatus de cita
---

Base URL: `/api/v1/scheduling/status-appointment`

## Qué hace

Administra los estados de las citas, por ejemplo `Pendiente`, `Confirmada`, `Cancelada`.

## Endpoints

### POST `/`

Body:

- `name` (string, requerido, 2..80)
- `color_hex` (string HEX opcional, por ejemplo `#FFAA00`)

Ejemplo:

```json
{ "name": "Pendiente", "color_hex": "#F59E0B" }
```

Respuesta 201:

```json
{
  "message": "Status de cita creado éxitosamente",
  "data": { "id": 1, "name": "Pendiente", "color_hex": "#F59E0B" }
}
```

### GET `/`

Lista todos los estados.

### GET `/:id`

Devuelve un estado por ID.

### PUT `/:id`

Body opcional:

- `name` (string, 2..80)
- `color_hex` (string HEX)

### DELETE `/:id`

Elimina el estado. Es `hard delete`.
