# AppointmentCalendar

Componente de calendario reutilizable basado en **react-big-calendar**, diseñado para usarse en todo el sistema (paciente/doctor/recepción/admin) **sin depender de pasar funciones desde Astro**.

La motivación principal es que en `.astro` no es confiable pasar handlers (funciones) a componentes React hidratados. Por eso, este componente se configura mediante props **serializables** (strings/números/objetos simples).

## Dónde está

- Implementación: `src/components/react/AppointmentCalendar.tsx`
- Ejemplo de uso (paciente): `src/pages/modules/pacient/[pacient_id]/schedule-appointment.astro`

## Qué resuelve

- Renderiza citas (eventos) en vistas `month/week/day`.
- Abre un **modal** al hacer click en una cita.
- En el modal muestra información y botones configurables.
- Los botones pueden:
  - Navegar a rutas (`kind: "link"`)
  - Ejecutar acciones a un endpoint (`kind: "api"`) y opcionalmente refrescar eventos.

## Props

### Fuente de datos

Puedes cargar datos de dos maneras:

1) **Controlado** (el padre entrega las citas):

- `citas?: Cita[]`

2) **Auto-fetch** (el componente consulta un endpoint):

- `endpoint?: string`

> `endpoint` debe ser el path relativo a `API_URL` (ver `src/lib/api.ts`).
> El fetch lo hace con SWR usando `fetcher` (`src/lib/fetcher.ts`).

### Rol

- `role?: 'pacient' | 'doctor' | 'receptionist' | 'admin'`

Se usa para definir acciones por defecto (si no pasas `actions`).

### context (clave)

- `context?: Record<string, string | number | undefined>`

`context` es un “diccionario” de variables extra que sirven para **rellenar templates** en `actions`.

Ejemplo típico:

- En paciente: `{ patientId: pacient_id }`
- En doctor: `{ doctorId: doctor_id }`

#### Cómo funciona

Las acciones usan plantillas con placeholders:

- `"/dashboard/pacientes/{patientId}"`
- `"/appointments/{citaId}/cancel"`

Cuando se selecciona una cita, el componente arma un `ctx` con datos de la cita y lo mezcla con `context`:

- Siempre disponibles desde la cita:
  - `{citaId}` (id de la cita)
  - `{estado}`, `{doctor}`, `{especialidad}`, `{fecha}`, `{hora}`
  - `{role}`
- Extra desde tu pantalla:
  - cualquier key que pongas en `context` (ej. `{patientId}`)

**Fail-closed:** si falta algún placeholder requerido (`undefined`), el template se considera inválido y la acción queda deshabilitada.

### actions (botones del modal)

- `actions?: CalendarAction[]`

Permite definir exactamente qué botones aparecen y qué hacen.

#### Acción tipo link

```ts
{
  id: 'historial',
  label: 'Ver Historial Clínico',
  kind: 'link',
  variant: ButtonTheme.SECONDARY,
  hrefTemplate: '/dashboard/pacientes/{patientId}',
}
```

#### Acción tipo api

```ts
{
  id: 'cancel',
  label: 'Cancelar',
  kind: 'api',
  variant: ButtonTheme.DANGER_GHOST,
  method: 'POST',
  endpointTemplate: '/appointments/{citaId}/cancel',
  refreshOnSuccess: true,
  closeOnSuccess: true,
}
```

Notas:
- `body` es opcional y puede contener strings con placeholders.
- `refreshOnSuccess` revalida SWR (solo es útil si estás usando `endpoint`).

### statusClassByEstado (estilo por estado)

- `statusClassByEstado?: Record<string, string>`

Permite cambiar la clase Tailwind base del color por estado. Por defecto:

- `Pendiente` → `bg-amber-500`
- `Confirmada` → `bg-green-500`
- `Cancelada` → `bg-red-500`
- `Finalizada` → `bg-blue-500`

### heightPx (layout)

- `heightPx?: number` (default `600`)

Fuerza altura explícita para evitar el caso típico donde el calendario “no se ve” por colapso de altura.

## Tipos esperados

### Cita

```ts
export interface Cita {
  id: number
  doctor: string
  especialidad: string
  fecha: string // YYYY-MM-DD
  hora: string  // "10:00 AM" | "02:30 PM" etc
  estado: string
}
```

## Ejemplos de uso

### 1) Astro + citas mock (controlado)

```astro
---
import AppointmentCalendar from "@/components/react/AppointmentCalendar"
const { pacient_id } = Astro.params
const citasMock = [/* ... */]
---

<AppointmentCalendar
  role="pacient"
  citas={citasMock}
  context={{ patientId: pacient_id }}
  heightPx={600}
  client:load
/>
```

### 2) Astro + endpoint (auto-fetch)

```astro
---
import AppointmentCalendar from "@/components/react/AppointmentCalendar"
const { pacient_id } = Astro.params
---

<AppointmentCalendar
  role="pacient"
  endpoint="/appointments"
  context={{ patientId: pacient_id }}
  client:load
/>
```

### 3) Configurar botones por rol (recepción)

```astro
---
import AppointmentCalendar from "@/components/react/AppointmentCalendar"
const { pacient_id } = Astro.params
---

<AppointmentCalendar
  role="receptionist"
  endpoint="/appointments"
  context={{ patientId: pacient_id }}
  actions={[
    {
      id: 'hist',
      label: 'Historial',
      kind: 'link',
      hrefTemplate: '/dashboard/pacientes/{patientId}',
    },
    {
      id: 'cancel',
      label: 'Cancelar',
      kind: 'api',
      method: 'POST',
      endpointTemplate: '/appointments/{citaId}/cancel',
      refreshOnSuccess: true,
    },
  ]}
  client:load
/>
```

## Notas y gotchas

- Si usas `.astro`, evita pasar funciones como props para acciones. Usa `actions + context`.
- `client:only="react"` puede dar la sensación de “no aparece”. Se recomienda `client:load` para UX.
- La fecha/hora se parsea desde strings con AM/PM y corrige `12:xx AM` → `00:xx`.

## Próximo paso sugerido

Cuando tengas endpoints reales, conviene estandarizar:
- Estructura de respuesta de `GET /appointments`
- Endpoints para acciones (confirmar/cancelar/finalizar)
- Qué `context` necesita cada rol (patientId/doctorId/etc.)
