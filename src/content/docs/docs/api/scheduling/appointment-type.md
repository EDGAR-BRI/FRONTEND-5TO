---
title: Tipos de cita
---

Base URL: `/api/v1/scheduling/appointment-type`

## Qué hace

Administra el catálogo de tipos de cita. Este recurso se usa luego en `appointment.typeId`.

## Endpoints

### POST `/`

Body:

- `name` (string, requerido, 2..80)

Ejemplo:

```json
{ "name": "Consulta" }
```

Respuesta 201:

```json
{
  "message": "Tipo de cita creado éxitosamente",
  "data": { "id": 1, "name": "Consulta" }
}
```

### GET `/`

Lista todos los tipos de cita.

### GET `/:id`

Devuelve un tipo por ID.

### PUT `/:id`

Body opcional:

- `name` (string, 2..80)

### DELETE `/:id`

Elimina el tipo de cita. Es `hard delete`.
