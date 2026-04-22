import { useMemo, useState, useCallback } from 'react'
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

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppointmentCalendarRole = 'pacient' | 'doctor' | 'receptionist' | 'admin'

export interface Cita {
  id: number
  doctor: string
  doctorId?: number | string
  especialidad: string
  fecha: string
  hora: string
  estado: string
  paciente?: string
  pacienteId?: number | string
  [key: string]: any
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

const DEFAULT_ESTADOS = ['Pendiente', 'Confirmada', 'Cancelada', 'Finalizada']

export type AppointmentCalendarProps = {
  // Fuente de citas
  citas?: Cita[]
  endpoint?: string

  role?: AppointmentCalendarRole

  context?: Record<string, string | number | undefined>
  actions?: CalendarAction[]
  statusClassByEstado?: Record<string, string>

  // Estados para el select de edición (solo receptionist/admin)
  availableEstados?: string[]
  estadosEndpoint?: string   // GET → string[]

  // Endpoint PATCH para cambiar estado: template con {citaId}
  updateEndpoint?: string

  heightPx?: number
}

// ─── Localizer ────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFechaHora12h(fecha: string, hora: string): Date {
  const normalized = hora.trim().toUpperCase()
  const isAM = /\bAM\b$/.test(normalized)
  const isPM = /\bPM\b$/.test(normalized)
  const timePart = normalized.replace(/\s*(AM|PM)\s*$/, '').trim()
  const [hoursPart, minutesPart = '0'] = timePart.split(':')
  let hours = Number(hoursPart)
  const minutes = Number(minutesPart)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return new Date(`${fecha}T${timePart}`)
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
    if (raw === undefined) { missing = true; return '' }
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppointmentCalendar({
  citas,
  endpoint,
  role = 'pacient',
  context,
  actions,
  statusClassByEstado,
  availableEstados,
  estadosEndpoint,
  updateEndpoint,
  heightPx = 600,
}: AppointmentCalendarProps) {
  const isReceptionist = role === 'receptionist' || role === 'admin'

  // ── Modal ──────────────────────────────────────────────────────────────────
  const { isOpen, openModal, closeModal } = useModal(false)
  const [modalMode, setModalMode] = useState<'detail' | 'edit'>('detail')
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Edit-estado state
  const [editEstado, setEditEstado] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)

  const closeAndClear = useCallback(() => {
    closeModal()
    setCitaSeleccionada(null)
    setModalMode('detail')
    setEditEstado('')
  }, [closeModal])

  // ── Citas data ─────────────────────────────────────────────────────────────
  const { data: citasFromEndpoint, mutate } = useSWR<Cita[]>(endpoint ?? null, fetcher)
  const effectiveCitas = citas ?? citasFromEndpoint ?? []

  // ── Estados disponibles ────────────────────────────────────────────────────
  const { data: estadosFromEndpoint } = useSWR<string[]>(
    isReceptionist && !availableEstados && estadosEndpoint ? estadosEndpoint : null,
    fetcher
  )
  const effectiveEstados = availableEstados ?? estadosFromEndpoint ?? DEFAULT_ESTADOS

  // ── Calendar events ────────────────────────────────────────────────────────
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

  // ── Event styles ───────────────────────────────────────────────────────────
  const defaultStatusClasses: Record<string, string> = {
    Pendiente:  'bg-amber-500',
    Confirmada: 'bg-green-500',
    Cancelada:  'bg-red-500',
    Finalizada: 'bg-blue-500',
  }

  const aplicarEstilosEvento = (evento: EventoCalendario) => {
    const map = statusClassByEstado ?? defaultStatusClasses
    const bgClass = map[evento.estado] ?? 'bg-gray-500'
    return {
      className: `${bgClass} text-white border-none rounded-md px-2 py-1 text-xs font-semibold shadow-sm`,
    }
  }

  // ── Event click ────────────────────────────────────────────────────────────
  const onSelectEvent = (evento: EventoCalendario) => {
    setCitaSeleccionada(evento.cita)
    setModalMode('detail')
    openModal()
  }

  // ── Default actions by role ────────────────────────────────────────────────
  const resolvedActions: CalendarAction[] = useMemo(() => {
    if (actions) return actions
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

  // ── Modal actions (non-receptionist roles) ─────────────────────────────────
  const modalActions = useMemo(() => {
    if (!citaSeleccionada) return []
    const ctx: Record<string, string | number | undefined> = {
      role,
      ...citaSeleccionada,
      citaId: citaSeleccionada.id,
      ...context,
    }
    return resolvedActions.map((a) => {
      const variantVal = a.variant ?? ButtonTheme.SECONDARY
      if (a.kind === 'link') {
        const href = interpolateTemplate(a.hrefTemplate, ctx)
        const enabled = Boolean(href)
        return {
          id: a.id, label: a.label, variant: variantVal, enabled,
          onClick: () => { if (!enabled) return; window.location.assign(href); closeAndClear() },
        }
      }
      const endpointResolved = interpolateTemplate(a.endpointTemplate, ctx)
      const enabled = Boolean(endpointResolved)
      return {
        id: a.id, label: a.label, variant: variantVal, enabled,
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

  // ── Save estado ────────────────────────────────────────────────────────────
  const handleSaveEstado = async () => {
    if (!citaSeleccionada || !updateEndpoint) return
    setSaveLoading(true)
    try {
      const ctx = { citaId: citaSeleccionada.id, ...context }
      const ep = interpolateTemplate(updateEndpoint, ctx as Record<string, string | number | undefined>)
      if (!ep) return
      const res = await api(ep, {
        method: 'PATCH',
        body: JSON.stringify({ estado: editEstado }),
      })
      if (res.ok) { await mutate(); closeAndClear() }
    } finally {
      setSaveLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-white p-4" style={{ height: heightPx }}>
      <style>{`
        .rbc-btn-group button { color: #374151; border-color: #E5E7EB; }
        .rbc-btn-group .rbc-active { background-color: #EFF6FF; color: #2563EB; box-shadow: none; }
        .rbc-today { background-color: #F8FAFC; }
        .rbc-header { padding: 8px 0; font-weight: 600; color: #6B7280; font-size: 0.875rem; text-transform: capitalize; }
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

      <Modal
        isOpen={isOpen}
        onClose={closeAndClear}
        title={modalMode === 'edit' ? 'Cambiar estado' : 'Detalle de cita'}
      >
        {citaSeleccionada && (
          <div className="space-y-4">

            {modalMode === 'detail' && (
              <>
                <div className="space-y-1">
                  {citaSeleccionada.paciente && (
                    <div className="text-xs text-primary-500">
                      Paciente:{' '}
                      <span className="font-medium text-primary-900">{citaSeleccionada.paciente}</span>
                    </div>
                  )}
                  <div className="text-sm font-semibold text-primary-900">{citaSeleccionada.doctor}</div>
                  <div className="text-sm text-primary-700">{citaSeleccionada.especialidad}</div>
                  <div className="text-xs text-primary-700">
                    {citaSeleccionada.fecha} · {citaSeleccionada.hora}
                  </div>
                  <div className="text-xs text-primary-700">
                    Estado: <span className="font-medium">{citaSeleccionada.estado}</span>
                  </div>
                </div>

                {!isReceptionist && modalActions.length > 0 && (
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
                )}

                <div className="flex justify-end gap-2">
                  {isReceptionist && updateEndpoint && (
                    <Button
                      label="Cambiar estado"
                      variant={ButtonTheme.SECONDARY}
                      size="sm"
                      onClick={() => {
                        setEditEstado(citaSeleccionada.estado)
                        setModalMode('edit')
                      }}
                    />
                  )}
                  <Button label="Cerrar" variant={ButtonTheme.GHOST} size="sm" onClick={closeAndClear} />
                </div>
              </>
            )}

            {modalMode === 'edit' && isReceptionist && (
              <>
                <div className="text-xs text-primary-500 space-y-0.5">
                  <div className="font-medium text-primary-900">{citaSeleccionada.doctor}</div>
                  <div>{citaSeleccionada.fecha} · {citaSeleccionada.hora}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nuevo estado
                  </label>
                  {effectiveEstados.length > 0 ? (
                    <select
                      value={editEstado}
                      onChange={(e) => setEditEstado(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      {effectiveEstados.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editEstado}
                      onChange={(e) => setEditEstado(e.target.value)}
                      placeholder="Ej: Pendiente, Confirmada…"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    label="Cancelar"
                    variant={ButtonTheme.GHOST}
                    size="sm"
                    onClick={() => setModalMode('detail')}
                    disabled={saveLoading}
                  />
                  <Button
                    label="Guardar"
                    variant={ButtonTheme.PRIMARY}
                    size="sm"
                    disabled={!editEstado || saveLoading}
                    loading={saveLoading}
                    onClick={handleSaveEstado}
                  />
                </div>
              </>
            )}

          </div>
        )}
      </Modal>
    </div>
  )
}