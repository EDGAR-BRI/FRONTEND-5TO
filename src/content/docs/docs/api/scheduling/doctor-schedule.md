---
title: DoctorSchedule
---

Base URL: `/api/v1/scheduling/doctor-schedule`

## Qué hace

Define la vigencia de un horario de trabajo para un doctor. Las disponibilidades diarias cuelgan de `doctorScheduleId`.

## Endpoints

### POST `/`

Body:

- `doctorId` (int > 0, requerido, debe existir y estar activo)
- `period_start` (string ISO, requerido)
- `period_end` (string ISO o `null`, opcional)

Ejemplo:

```json
{
	"doctorId": 3,
	"period_start": "2026-03-01T00:00:00.000Z",
	"period_end": null
}
```

### GET `/`

Filtros opcionales:

- `doctorId` (int > 0) - filtra por doctor
- `period_end` (string o `null`) - útil para pedir solo vigencias cerradas o vigentes según el valor enviado

### GET `/doctor/:doctorId`

Devuelve todos los schedules de un doctor, ordenados por `period_start` descendente.

### GET `/:id`

Devuelve un schedule por ID con su doctor y disponibilidades.

### PUT `/:id`

Body opcional:

- `doctorId` (int > 0)
- `period_start` (string ISO)
- `period_end` (string ISO o `null`)

### DELETE `/:id`

Elimina el schedule. Es `hard delete`.

## Notas

- `period_end` debe ser mayor que `period_start` cuando ambos existen.
- Un schedule puede tener muchas disponibilidades relacionadas.
