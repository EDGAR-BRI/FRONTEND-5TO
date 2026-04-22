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
<<<<<<< HEAD
  paciente?: string
  pacienteId?: number | string
  [key: string]: any
=======
  pacienteNombre: string;
  pacienteId: string;
  motivo: string;
  tipoConsulta: 'Presencial' | 'Teleconsulta' | 'Examen';
  notasAdicionales?: string;
>>>>>>> 3991eec1fd97cafb092f26ce79c6971c727c9f64
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
<<<<<<< HEAD
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
=======
  | { id: string; label: string; variant?: variant; kind: 'link'; hrefTemplate: string }
  | { id: string; label: string; variant?: variant; kind: 'api'; method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'; endpointTemplate: string; body?: Record<string, unknown>; refreshOnSuccess?: boolean; closeOnSuccess?: boolean }
  | { id: string; label: string; variant?: variant; kind: 'event'; eventName: string }
>>>>>>> 3991eec1fd97cafb092f26ce79c6971c727c9f64

export type AppointmentCalendarProps = {
  // Fuente de citas
  citas?: Cita[]
  endpoint?: string
<<<<<<< HEAD

=======
>>>>>>> 3991eec1fd97cafb092f26ce79c6971c727c9f64
  role?: AppointmentCalendarRole
  context?: Record<string, string | number | undefined>
  actions?: CalendarAction[]
  statusClassByEstado?: Record<string, string>
<<<<<<< HEAD

  // Estados para el select de edición (solo receptionist/admin)
  availableEstados?: string[]
  estadosEndpoint?: string   // GET → string[]

  // Endpoint PATCH para cambiar estado: template con {citaId}
  updateEndpoint?: string

=======
>>>>>>> 3991eec1fd97cafb092f26ce79c6971c727c9f64
  heightPx?: number
}

const locales = { es }
const localizer = dateFnsLocalizer({
  format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), getDay, locales,
})

const mensajesEspanol = {
  allDay: 'Todo el día', previous: 'Anterior', next: 'Siguiente', today: 'Hoy',
  month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda', date: 'Fecha',
  time: 'Hora', event: 'Cita', noEventsInRange: 'No hay citas en este rango.',
}

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

<<<<<<< HEAD
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
=======
const badgeColors: Record<string, string> = {
  'Pendiente': 'bg-amber-100 text-amber-800 border-amber-200',
  'Confirmada': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Cancelada': 'bg-rose-100 text-rose-800 border-rose-200',
  'Finalizada': 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function AppointmentCalendar({
  citas, endpoint, role = 'pacient', context, actions, statusClassByEstado, heightPx = 600,
}: AppointmentCalendarProps) {
  const { isOpen, openModal, closeModal } = useModal(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const closeAndClear = () => {
    closeModal()
    setCitaSeleccionada(null)
  }

  const swrKey = useMemo(() => endpoint ? endpoint : null, [endpoint])
  const { data: citasFromEndpoint, mutate } = useSWR<Cita[]>(swrKey, fetcher)
  const effectiveCitas = citas ?? citasFromEndpoint ?? []

>>>>>>> 3991eec1fd97cafb092f26ce79c6971c727c9f64
  const eventosAdaptados: EventoCalendario[] = useMemo(
    () =>
      effectiveCitas.map((cita) => {
        const fechaBase = parseFechaHora12h(cita.fecha, cita.hora)
        const fechaFin = new Date(fechaBase)
        fechaFin.setMinutes(fechaFin.getMinutes() + 45)

        return {
          id: cita.id,
          title: `${cita.pacienteNombre || 'Paciente'} - ${cita.hora}`,
          start: fechaBase,
          end: fechaFin,
          estado: cita.estado,
          cita,
        }
      }),
    [effectiveCitas]
  )

<<<<<<< HEAD
  // ── Event styles ───────────────────────────────────────────────────────────
  const defaultStatusClasses: Record<string, string> = {
    Pendiente:  'bg-amber-500',
    Confirmada: 'bg-green-500',
    Cancelada:  'bg-red-500',
    Finalizada: 'bg-blue-500',
=======
  const onSelectEvent = (evento: EventoCalendario) => {
    setCitaSeleccionada(evento.cita)
    openModal()
>>>>>>> 3991eec1fd97cafb092f26ce79c6971c727c9f64
  }

  const aplicarEstilosEvento = (evento: EventoCalendario) => {
    const defaultClasses: Record<string, string> = {
      Pendiente: 'bg-amber-500', Confirmada: 'bg-emerald-500', Cancelada: 'bg-rose-500', Finalizada: 'bg-blue-500',
    }
    const map = statusClassByEstado ?? defaultClasses
    const bgClass = map[evento.estado] ?? 'bg-slate-500'

    return {
      className: `${bgClass} text-white border-none rounded-md px-2 py-1 text-xs font-semibold shadow-sm`,
    }
  }

<<<<<<< HEAD
  // ── Event click ────────────────────────────────────────────────────────────
  const onSelectEvent = (evento: EventoCalendario) => {
    setCitaSeleccionada(evento.cita)
    setModalMode('detail')
    openModal()
  }

  // ── Default actions by role ────────────────────────────────────────────────
=======
>>>>>>> 3991eec1fd97cafb092f26ce79c6971c727c9f64
  const resolvedActions: CalendarAction[] = useMemo(() => {
    if (actions) return actions

    if (role === 'doctor') {
      return [
        {
          id: 'historial',
          label: 'Ver Historial Clínico',
          variant: ButtonTheme.SECONDARY,
          kind: 'link',
          hrefTemplate: '/dashboard/pacientes/{pacienteId}',
        },
        {
          // Corregimos el ID duplicado
          id: 'iniciar-consulta-evento',
          label: 'Iniciar Consulta',
          variant: ButtonTheme.PRIMARY,
          kind: 'event',
          eventName: 'request-start-consultation',
        }
      ]
    }
    return []
  }, [actions, role])

<<<<<<< HEAD
  // ── Modal actions (non-receptionist roles) ─────────────────────────────────
=======
>>>>>>> 3991eec1fd97cafb092f26ce79c6971c727c9f64
  const modalActions = useMemo(() => {
    if (!citaSeleccionada) return []

    const ctx: Record<string, string | number | undefined> = {
      role, ...citaSeleccionada, citaId: citaSeleccionada.id, ...context,
    }

    return resolvedActions.map((a) => {
<<<<<<< HEAD
      const variantVal = a.variant ?? ButtonTheme.SECONDARY
=======
      const variant = a.variant ?? ButtonTheme.SECONDARY

      // 1. Evaluación para enlaces
>>>>>>> 3991eec1fd97cafb092f26ce79c6971c727c9f64
      if (a.kind === 'link') {
        const href = interpolateTemplate(a.hrefTemplate, ctx)
        const enabled = Boolean(href)
        return {
<<<<<<< HEAD
          id: a.id, label: a.label, variant: variantVal, enabled,
          onClick: () => { if (!enabled) return; window.location.assign(href); closeAndClear() },
=======
          id: a.id, label: a.label, variant, enabled,
          onClick: () => {
            if (!enabled) return
            window.location.assign(href)
            closeAndClear()
          },
>>>>>>> 3991eec1fd97cafb092f26ce79c6971c727c9f64
        }
      }

      // 2. Evaluación para Eventos (ESTA ES LA PIEZA QUE TE FALTABA)
      if (a.kind === 'event') {
        return {
          id: a.id, label: a.label, variant, enabled: true,
          onClick: () => {
            const customEvent = new CustomEvent(a.eventName, {
              detail: { appointment: citaSeleccionada }
            });
            window.dispatchEvent(customEvent);
            closeAndClear();
          }
        }
      }

      // 3. Evaluación para API
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

<<<<<<< HEAD
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
=======
  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200" style={{ height: heightPx }}>
>>>>>>> 3991eec1fd97cafb092f26ce79c6971c727c9f64
      <style>{`
        .rbc-btn-group button { color: #374151; border-color: #E5E7EB; }
        .rbc-btn-group .rbc-active { background-color: #EFF6FF; color: #2563EB; box-shadow: none; }
        .rbc-today { background-color: #F8FAFC; }
        .rbc-header { padding: 8px 0; font-weight: 600; color: #6B7280; font-size: 0.875rem; text-transform: capitalize;}
        .rbc-event { padding: 2px 5px; }
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

<<<<<<< HEAD
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

=======
      <Modal isOpen={isOpen} onClose={closeAndClear} title="Detalles de la Cita">
        {!citaSeleccionada ? null : (
          <div className="flex flex-col gap-6 w-full max-w-md">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {citaSeleccionada.pacienteNombre || 'Paciente No Registrado'}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {citaSeleccionada.tipoConsulta || 'Consulta General'}
                </p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${badgeColors[citaSeleccionada.estado] || 'bg-slate-100 text-slate-700'}`}>
                {citaSeleccionada.estado}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha y Hora</span>
                <p className="text-sm font-semibold text-slate-700">{citaSeleccionada.fecha}</p>
                <p className="text-sm text-slate-600">{citaSeleccionada.hora}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Especialista</span>
                <p className="text-sm font-semibold text-slate-700">{citaSeleccionada.doctor}</p>
                <p className="text-sm text-slate-600 truncate">{citaSeleccionada.especialidad}</p>
              </div>
            </div>

            <div className="bg-primary-50/50 p-4 rounded-lg border border-primary-100">
               <span className="block text-[11px] font-bold text-primary-600 uppercase tracking-wider mb-1">Motivo de la visita</span>
               <p className="text-sm text-slate-700 font-medium">{citaSeleccionada.motivo || 'No especificado'}</p>
            </div>

            {citaSeleccionada.notasAdicionales && (
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notas previas</span>
                <p className="text-sm text-slate-600 italic border-l-2 border-slate-300 pl-3">
                  "{citaSeleccionada.notasAdicionales}"
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              {modalActions.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 w-full">
                  {modalActions.map((a) => (
                    <div key={a.id} className={a.variant === ButtonTheme.PRIMARY ? "col-span-2" : "col-span-1"}>
                        <Button
                          label={a.label}
                          variant={a.variant}
                          disabled={!a.enabled || (actionLoadingId !== null && actionLoadingId !== a.id)}
                          loading={actionLoadingId === a.id}
                          onClick={() => a.onClick()}
                          className="w-full"
                        />
                    </div>
                  ))}
                </div>
              ) : null}
              
              <Button 
                label="Cerrar Detalles" 
                variant={ButtonTheme.GHOST} 
                onClick={closeAndClear} 
                className="w-full text-slate-500 hover:text-slate-700 mt-2"
              />
            </div>

>>>>>>> 3991eec1fd97cafb092f26ce79c6971c727c9f64
          </div>
        )}
      </Modal>
    </div>
  )
}