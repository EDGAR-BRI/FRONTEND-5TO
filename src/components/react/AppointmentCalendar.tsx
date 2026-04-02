import { useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import type { Formats } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale/es'
import useSWR from 'swr'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import { Modal } from '@/components/react/primary/Modal'
import { Button, ButtonTheme, type variant } from '@/components/react/primary/Button'
import { useModal } from '@/hooks/UseModal'
import { fetcher } from '@/lib/fetcher'
import { api } from '@/lib/api'

export type AppointmentCalendarRole = 'pacient' | 'doctor' | 'receptionist' | 'admin'

export interface Cita {
  id: number
  doctor: string
  especialidad: string
  fecha: string
  hora: string
  estado: string
}

interface EventoCalendario {
  id: number
  title: string
  start: Date
  end: Date
  estado: string
  cita: Cita
}

export type CalendarAction =
  | {
      id: string
      label: string
      variant?: variant
      kind: 'link'
      hrefTemplate: string
    }
  | {
      id: string
      label: string
      variant?: variant
      kind: 'api'
      method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      endpointTemplate: string
      body?: Record<string, unknown>
      refreshOnSuccess?: boolean
      closeOnSuccess?: boolean
    }

export type AppointmentCalendarProps = {
  // Fuente de datos (elige una):
  // - `citas`: modo controlado
  // - `endpoint`: auto-fetch (ideal en Astro)
  citas?: Cita[]
  endpoint?: string

  role?: AppointmentCalendarRole

  // Contexto para templates (serializable):
  // Ej: { patientId: pacient_id, doctorId: doctor_id }
  context?: Record<string, string | number | undefined>

  // Configuración del modal
  actions?: CalendarAction[]

  // Estilos por estado
  statusClassByEstado?: Record<string, string>

  // Layout
  heightPx?: number
}

const locales = { es }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

const mensajesEspanol = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Cita',
  noEventsInRange: 'No hay citas en este rango.',
}

function parseFechaHora12h(fecha: string, hora: string): Date {
  const normalized = hora.trim().toUpperCase()
  const isAM = /\bAM\b$/.test(normalized)
  const isPM = /\bPM\b$/.test(normalized)

  const timePart = normalized.replace(/\s*(AM|PM)\s*$/, '').trim()
  const [hoursPart, minutesPart = '0'] = timePart.split(':')

  let hours = Number(hoursPart)
  const minutes = Number(minutesPart)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return new Date(`${fecha}T${timePart}`)
  }

  if (isAM && hours === 12) hours = 0
  if (isPM && hours !== 12) hours += 12

  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  return new Date(`${fecha}T${hh}:${mm}:00`)
}

const formatos12h: Formats = {
  timeGutterFormat: 'hh:mm a',
  agendaTimeFormat: 'hh:mm a',
  eventTimeRangeFormat: ({ start, end }, culture, localizer) => {
    if (!localizer) return ''
    return `${localizer.format(start, 'hh:mm a', culture)} – ${localizer.format(end, 'hh:mm a', culture)}`
  },
  agendaTimeRangeFormat: ({ start, end }, culture, localizer) => {
    if (!localizer) return ''
    return `${localizer.format(start, 'hh:mm a', culture)} – ${localizer.format(end, 'hh:mm a', culture)}`
  },
}

function interpolateTemplate(template: string, ctx: Record<string, string | number | undefined>) {
  let missing = false

  const out = template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const raw = ctx[key]
    if (raw === undefined) {
      missing = true
      return ''
    }
    return encodeURIComponent(String(raw))
  })

  return missing ? '' : out
}

function interpolateBody(body: Record<string, unknown>, ctx: Record<string, string | number | undefined>) {
  const next: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') next[key] = interpolateTemplate(value, ctx)
    else next[key] = value
  }
  return next
}

export default function AppointmentCalendar({
  citas,
  endpoint,
  role = 'pacient',
  context,
  actions,
  statusClassByEstado,
  heightPx = 600,
}: AppointmentCalendarProps) {
  const { isOpen, openModal, closeModal } = useModal(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const closeAndClear = () => {
    closeModal()
    setCitaSeleccionada(null)
  }

  const swrKey = useMemo(() => {
    if (!endpoint) return null
    return endpoint
  }, [endpoint])

  const { data: citasFromEndpoint, mutate } = useSWR<Cita[]>(swrKey, fetcher)
  const effectiveCitas = citas ?? citasFromEndpoint ?? []

  const eventosAdaptados: EventoCalendario[] = useMemo(
    () =>
      effectiveCitas.map((cita) => {
        const fechaBase = parseFechaHora12h(cita.fecha, cita.hora)
        const fechaFin = new Date(fechaBase)
        fechaFin.setMinutes(fechaFin.getMinutes() + 45)

        return {
          id: cita.id,
          title: `${cita.doctor} - ${cita.especialidad}`,
          start: fechaBase,
          end: fechaFin,
          estado: cita.estado,
          cita,
        }
      }),
    [effectiveCitas]
  )

  const onSelectEvent = (evento: EventoCalendario) => {
    setCitaSeleccionada(evento.cita)
    openModal()
  }

  const defaultStatusClasses: Record<string, string> = {
    Pendiente: 'bg-amber-500',
    Confirmada: 'bg-green-500',
    Cancelada: 'bg-red-500',
    Finalizada: 'bg-blue-500',
  }

  const aplicarEstilosEvento = (evento: EventoCalendario) => {
    const map = statusClassByEstado ?? defaultStatusClasses
    const bgClass = map[evento.estado] ?? 'bg-gray-500'

    return {
      className: `${bgClass} text-white border-none rounded-md px-2 py-1 text-xs font-semibold shadow-sm`,
    }
  }

  const resolvedActions: CalendarAction[] = useMemo(() => {
    if (actions) return actions

    // Defaults simples por rol
    if (role === 'doctor') {
      return [
        {
          id: 'historial',
          label: 'Ver Historial Clínico',
          variant: ButtonTheme.SECONDARY,
          kind: 'link',
          hrefTemplate: '/dashboard/pacientes/{patientId}',
        },
        {
          id: 'consulta',
          label: 'Iniciar Consulta',
          variant: ButtonTheme.PRIMARY,
          kind: 'link',
          hrefTemplate: '/dashboard/pacientes/{patientId}?teleconsulta=1',
        },
      ]
    }

    return []
  }, [actions, role])

  const modalActions = useMemo(() => {
    if (!citaSeleccionada) return [] as Array<{ id: string; label: string; variant: variant; enabled: boolean; onClick: () => void | Promise<void> }>

    const ctx: Record<string, string | number | undefined> = {
      role,
      citaId: citaSeleccionada.id,
      estado: citaSeleccionada.estado,
      doctor: citaSeleccionada.doctor,
      especialidad: citaSeleccionada.especialidad,
      fecha: citaSeleccionada.fecha,
      hora: citaSeleccionada.hora,
      ...context,
    }

    return resolvedActions.map((a) => {
      const variant = a.variant ?? ButtonTheme.SECONDARY

      if (a.kind === 'link') {
        const href = interpolateTemplate(a.hrefTemplate, ctx)
        const enabled = Boolean(href)
        return {
          id: a.id,
          label: a.label,
          variant,
          enabled,
          onClick: () => {
            if (!enabled) return
            window.location.assign(href)
            closeAndClear()
          },
        }
      }

      const endpointResolved = interpolateTemplate(a.endpointTemplate, ctx)
      const enabled = Boolean(endpointResolved)

      return {
        id: a.id,
        label: a.label,
        variant,
        enabled,
        onClick: async () => {
          if (!enabled) return
          setActionLoadingId(a.id)
          try {
            const body = a.body ? interpolateBody(a.body, ctx) : undefined
            const response = await api(endpointResolved, {
              method: a.method,
              body: body ? JSON.stringify(body) : undefined,
            })

            if (!response.ok) return

            if (a.refreshOnSuccess) await mutate()
            if (a.closeOnSuccess ?? true) closeAndClear()
          } finally {
            setActionLoadingId(null)
          }
        },
      }
    })
  }, [citaSeleccionada, closeAndClear, context, mutate, resolvedActions, role])

  return (
    <div className="w-full bg-white p-4" style={{ height: heightPx }}>
      <style>{`
        .rbc-btn-group button { color: #374151; border-color: #E5E7EB; }
        .rbc-btn-group .rbc-active { background-color: #EFF6FF; color: #2563EB; box-shadow: none; }
        .rbc-today { background-color: #F8FAFC; }
        .rbc-header { padding: 8px 0; font-weight: 600; color: #6B7280; font-size: 0.875rem; text-transform: capitalize;}
      `}</style>

      <Calendar
        style={{ height: '100%' }}
        localizer={localizer}
        events={eventosAdaptados}
        startAccessor="start"
        endAccessor="end"
        culture="es"
        messages={mensajesEspanol}
        formats={formatos12h}
        eventPropGetter={aplicarEstilosEvento}
        onSelectEvent={onSelectEvent}
        views={['month', 'week', 'day']}
        defaultView="month"
        step={30}
        showMultiDayTimes
      />

      <Modal isOpen={isOpen} onClose={closeAndClear} title={citaSeleccionada ? 'Cita' : 'Detalle'}>
        {!citaSeleccionada ? null : (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-primary-900 font-semibold">{citaSeleccionada.doctor}</div>
              <div className="text-sm text-primary-700">{citaSeleccionada.especialidad}</div>
              <div className="text-xs text-primary-700">
                {citaSeleccionada.fecha} · {citaSeleccionada.hora}
              </div>
              <div className="text-xs text-primary-700">Estado: {citaSeleccionada.estado}</div>
            </div>

            {modalActions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {modalActions.map((a) => (
                  <Button
                    key={a.id}
                    label={a.label}
                    variant={a.variant}
                    size="sm"
                    disabled={!a.enabled || (actionLoadingId !== null && actionLoadingId !== a.id)}
                    loading={actionLoadingId === a.id}
                    onClick={() => a.onClick()}
                  />
                ))}
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button label="Cerrar" variant={ButtonTheme.GHOST} size="sm" onClick={closeAndClear} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
