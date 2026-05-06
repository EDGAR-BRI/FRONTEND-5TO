---
title: Citas
---

Base URL: `/api/v1/scheduling/appointment`

## Qué hace

Administra la creación, consulta y mantenimiento de citas médicas.

## Endpoints

### POST `/`

Body:

- `doctorId` (int > 0, opcional, debe existir y estar activo)
- `specialtyId` (int > 0, opcional, debe existir y estar activa)
- `patientId` (int > 0, requerido, debe existir y estar activo)
- `statusId` (int > 0, requerido, debe existir)
- `typeId` (int > 0, requerido, debe existir)
- `reson_visit` (string opcional, 1..5000)
- `price` (number, requerido, > 0)
- `date_time` (string ISO, requerido)

Reglas clave:

- Debe enviar exactamente uno: `doctorId` o `specialtyId`.
- Si envías `specialtyId`, el backend busca un doctor activo de esa especialidad que tenga disponibilidad en esa fecha/hora.
- Antes de crear, se valida horario vigente, disponibilidad del día, override de agenda y límite de pacientes.
- Se rechaza si el paciente ya tiene otra cita no cancelada con ese doctor en ese mismo horario.

Ejemplo:

```json
{
  "specialtyId": 1,
  "patientId": 4,
  "statusId": 1,
  "typeId": 1,
  "reson_visit": "Dolor de cabeza",
  "price": 50,
  "date_time": "2026-03-23T14:00:00.000Z"
}
```

### GET `/`

Lista citas.

Query params soportados:

- `range` - filtra por rango de fechas usando `date_time`
- valores válidos: `hoy`, `semana`, `mes`, `today`, `week`, `month`

Ejemplos:

- `GET /api/v1/scheduling/appointment?range=hoy`
- `GET /api/v1/scheduling/appointment?range=semana`
- `GET /api/v1/scheduling/appointment?range=mes`

### GET `/doctor/:id`

Lista todas las citas de un doctor específico.

### GET `/:id`

Devuelve una cita por ID.

### PUT `/:id`

Body opcional:

- `doctorId` (int > 0)
- `specialtyId` (int > 0)
- `patientId` (int > 0)
- `statusId` (int > 0)
- `typeId` (int > 0)
- `reson_visit` (string 1..5000)
- `price` (number > 0)
- `date_time` (string ISO)

Ejemplo:

```json
{ "statusId": 2 }
```

### DELETE `/:id`

Elimina la cita. Es `hard delete`.

## Nota de respuesta

La respuesta incluye la cita con sus relaciones principales: `doctor`, `patient`, `status` y `type`.
