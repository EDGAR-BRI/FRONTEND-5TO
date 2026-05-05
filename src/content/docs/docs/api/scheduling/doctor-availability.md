---
title: Disponibilidad de doctor
---

Base URL: `/api/v1/scheduling/doctor-availability`

## Qué hace

Define las franjas concretas de atención dentro de un `DoctorSchedule`.

## Endpoints

### POST `/`

Body:

- `doctorScheduleId` (int > 0, requerido, debe existir)
- `day_of_week` (int, requerido, 0..6)
- `start_time` (string ISO, requerido)
- `end_time` (string ISO, requerido, debe ser mayor que `start_time`)
- `patient_limit` (int, requerido, > 0)

Ejemplo:

```json
{
  "doctorScheduleId": 10,
  "day_of_week": 1,
  "start_time": "2026-03-23T08:00:00.000Z",
  "end_time": "2026-03-23T12:00:00.000Z",
  "patient_limit": 10
}
```

### GET `/`

Filtros opcionales:

- `doctorId` (int > 0) - filtra por doctor
- `doctorScheduleId` (int > 0) - filtra por schedule
- `specialtyId` (int > 0) - filtra por especialidad
- `day_of_week` (int, 0..6) - filtra por día de la semana
- `date` (string YYYY-MM-DD) - prioriza el día de la fecha y usa el schedule vigente del doctor si también envías `doctorId`
- `morning` (`true|false`) - devuelve solo horarios que empiezan antes de las 12:00 UTC

Comportamiento especial cuando envías `doctorId` + `date`:

- Busca el `DoctorSchedule` vigente para esa fecha.
- Aplica el `DoctorScheduleOverride` de ese día si existe.
- Si el override marca `is_working = false`, devuelve vacío.
- Si el override trae `start_time` y `end_time`, devuelve solo las franjas que caen dentro de ese rango.

Ejemplos:

- `GET /api/v1/scheduling/doctor-availability?doctorId=3`
- `GET /api/v1/scheduling/doctor-availability?doctorScheduleId=10`
- `GET /api/v1/scheduling/doctor-availability?specialtyId=1`
- `GET /api/v1/scheduling/doctor-availability?day_of_week=1`
- `GET /api/v1/scheduling/doctor-availability?date=2026-03-28`
- `GET /api/v1/scheduling/doctor-availability?doctorId=3&date=2026-03-28&morning=true`

### GET `/:id`

Devuelve una disponibilidad por ID.

### PUT `/:id`

Body opcional:

- `doctorScheduleId` (int > 0)
- `day_of_week` (int, 0..6)
- `start_time` (string ISO)
- `end_time` (string ISO)
- `patient_limit` (int > 0)

### DELETE `/:id`

Elimina la disponibilidad. Es `hard delete`.
