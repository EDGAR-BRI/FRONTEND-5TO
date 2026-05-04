---
title: Scheduling
---

Base URL: `/api/v1/scheduling`

## Resumen

Scheduling agrupa la administración de citas y la disponibilidad médica. El flujo real del backend es este:

1. Se registran los catálogos base: [estatus de cita](status-appointment/) y [tipos de cita](appointment-type/).
2. Se crea un [DoctorSchedule](doctor-schedule/) para definir la vigencia del horario de un doctor.
3. Se cargan las [disponibilidades](doctor-availability/) por día y franja horaria.
4. Si aplica, se agregan [overrides](doctor-schedule-override/) para bloquear o ajustar un día específico.
5. Finalmente se crean y consultan las [citas](appointment/).

## Endpoints

- [Estatus de cita](status-appointment/) - CRUD del catálogo de estados.
- [Tipos de cita](appointment-type/) - CRUD del catálogo de tipos.
- [Citas](appointment/) - CRUD de citas y listado por doctor.
- [DoctorSchedule](doctor-schedule/) - CRUD de vigencias de horario.
- [Disponibilidad de doctor](doctor-availability/) - CRUD de franjas disponibles y filtros por fecha/doctor/especialidad.
- [Overrides de agenda del doctor](doctor-schedule-override/) - CRUD de excepciones de agenda por fecha.

## Notas Importantes

- El backend responde con el patrón `{ message, data, error }`.
- Los identificadores son enteros positivos en todos los módulos.
- Las fechas se envían en ISO 8601.
- Para horarios y citas, el backend usa validaciones cruzadas con doctores activos, especialidades activas y disponibilidad vigente.
