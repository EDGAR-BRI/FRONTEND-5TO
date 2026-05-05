---
title: Overrides de agenda del doctor
---

Base URL: `/api/v1/scheduling/doctor-schedule-override`

## Qué hace

Permite bloquear o ajustar un día específico de trabajo de un doctor sin tocar la vigencia general del schedule.

## Endpoints

### POST `/`

Body:

- `doctorId` (int > 0, requerido, debe existir y estar activo)
- `specific_date` (string ISO, requerido)
- `is_working` (boolean opcional)
- `start_time` (string ISO opcional)
- `end_time` (string ISO opcional)
- `reason` (string opcional, 1..500)

Reglas importantes:

- Si envías `start_time`, debes enviar también `end_time`.
- Si envías `end_time`, debes enviar también `start_time`.
- Si `is_working = false`, puedes bloquear el día sin pasar horas.

Ejemplo:

```json
{
  "doctorId": 3,
  "specific_date": "2026-03-24T00:00:00.000Z",
  "is_working": false,
  "reason": "Día libre"
}
```

### GET `/`

Lista todos los overrides, ordenados por doctor y fecha descendente.

### GET `/:id`

Devuelve un override por ID.

### PUT `/:id`

Body opcional:

- `doctorId` (int > 0)
- `specific_date` (string ISO)
- `is_working` (boolean)
- `start_time` (string ISO)
- `end_time` (string ISO)
- `reason` (string 1..500)

### DELETE `/:id`

Elimina el override. Es `hard delete`.
