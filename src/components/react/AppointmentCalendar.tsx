import { useMemo, useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import type { Formats, NavigateAction } from 'react-big-calendar'
import { format, parse, startOfWeek, startOfMonth, getDay, isBefore } from 'date-fns'
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
  pacienteNombre: string;
  pacienteId: string;
  motivo: string;
  tipoConsulta: 'Presencial' | 'Teleconsulta' | 'Examen';
  notasAdicionales?: string;
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
  | {
      id: string
      label: string
      variant?: variant
      kind: 'event'
      eventName: string
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
  heightPx?: number
  onSelectDate?: (date: string) => void
  onRangeChange?: (params: { view: 'month' | 'week' | 'day'; date: Date }) => void
  availableDays?: number[]
  /** Citas del doctor seleccionado */
  doctorAppointments?: { date_time: string; reson_visit?: string; patient: { user: { name: string } }; doctor: { user: { name: string }; specialty: { name: string } }; status: { name: string } }[]
  doctorSchedulesData?: { id: number, period_start: string, period_end: string | null }[]
  doctorAvailabilities?: { day_of_week: number, doctorScheduleId?: number }[]
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

const badgeColors: Record<string, string> = {
  'Pendiente': 'bg-amber-100 text-amber-800 border-amber-200',
  'Confirmada': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Cancelada': 'bg-rose-100 text-rose-800 border-rose-200',
  'Finalizada': 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function AppointmentCalendar({
  citas, endpoint, role = 'pacient', context, actions, statusClassByEstado, heightPx = 600, onSelectDate, onRangeChange, availableDays, doctorAppointments, doctorSchedulesData, doctorAvailabilities,
}: AppointmentCalendarProps) {
  const { isOpen, openModal, closeModal } = useModal(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month')
  const [dayListDate, setDayListDate] = useState<string | null>(null)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  // Mínimo: primer día del mes actual
  const minDate = useMemo(() => startOfMonth(new Date()), [])

  const handleNavigate = useCallback((newDate: Date, _view: any, action: NavigateAction) => {
    if (action === 'PREV' && isBefore(newDate, minDate)) return
    setCurrentDate(newDate)
    onRangeChange?.({ view: currentView, date: newDate })
  }, [currentView, minDate, onRangeChange])

  const handleViewChange = useCallback((view: 'month' | 'week' | 'day') => {
    setCurrentView(view)
    onRangeChange?.({ view, date: currentDate })
  }, [currentDate, onRangeChange])

  const handleSelectSlot = (slotInfo: { start: Date }) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (isBefore(slotInfo.start, today)) return
    // Bloquear días donde el doctor no trabaja
    if (doctorSchedulesData && doctorSchedulesData.length > 0 && doctorAvailabilities) {
      const dateUTC = new Date(Date.UTC(slotInfo.start.getFullYear(), slotInfo.start.getMonth(), slotInfo.start.getDate(), 0, 0, 0, 0));
      const activeSchedule = doctorSchedulesData.find(s => {
        const start = new Date(s.period_start);
        const end = s.period_end ? new Date(s.period_end) : null;
        return dateUTC >= start && (!end || dateUTC <= end);
      });
      if (!activeSchedule) return;
      const day = getDay(slotInfo.start);
      if (!doctorAvailabilities.some(a => a.doctorScheduleId === activeSchedule.id && a.day_of_week === day)) return;
    } else if (availableDays && availableDays.length > 0) {
      const dayOfWeek = getDay(slotInfo.start)
      if (!availableDays.includes(dayOfWeek)) return
    }
    const dateKey = format(slotInfo.start, 'yyyy-MM-dd')
    setSelectedDateKey(dateKey)
    onSelectDate?.(dateKey)
    setTimeout(() => setSelectedDateKey(null), 1500)
  }

  // Conteo de citas del doctor por fecha (YYYY-MM-DD)
  const appointmentCountByDate = useMemo(() => {
    if (!doctorAppointments || doctorAppointments.length === 0) return {}
    const counts: Record<string, number> = {}
    for (const apt of doctorAppointments) {
      const cleanDate = apt.date_time.replace('Z', '').replace(' ', 'T')
      const dateKey = format(new Date(cleanDate), 'yyyy-MM-dd')
      counts[dateKey] = (counts[dateKey] || 0) + 1
    }
    return counts
  }, [doctorAppointments])

  // Citas agrupadas por fecha para el modal de listado
  const appointmentsByDate = useMemo(() => {
    if (!doctorAppointments || doctorAppointments.length === 0) return {} as Record<string, typeof doctorAppointments>
    const groups: Record<string, typeof doctorAppointments> = {}
    for (const apt of doctorAppointments) {
      const cleanDate = apt.date_time.replace('Z', '').replace(' ', 'T')
      const dateKey = format(new Date(cleanDate), 'yyyy-MM-dd')
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(apt)
    }
    // Ordenar cada grupo por hora
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => a.date_time.localeCompare(b.date_time))
    }
    return groups
  }, [doctorAppointments])

  const dayPropGetter = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isPast = isBefore(date, today)
    const dateKey = format(date, 'yyyy-MM-dd')
    const aptCount = appointmentCountByDate[dateKey] || 0
    const isSelected = selectedDateKey === dateKey

    if (isPast) {
      return { className: 'cal-day-past' }
    }

    const classes: string[] = ['cal-day-selectable']
    if (isSelected) classes.push('cal-day-selected')

    let isWorkDay = false;
    if (doctorSchedulesData && doctorSchedulesData.length > 0 && doctorAvailabilities) {
      const dateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
      const activeSchedule = doctorSchedulesData.find(s => {
        const start = new Date(s.period_start);
        const end = s.period_end ? new Date(s.period_end) : null;
        return dateUTC >= start && (!end || dateUTC <= end);
      });
      if (activeSchedule) {
        const day = getDay(date);
        isWorkDay = doctorAvailabilities.some(a => a.doctorScheduleId === activeSchedule.id && a.day_of_week === day);
      }
    } else if (availableDays && availableDays.length > 0) {
      const day = getDay(date);
      isWorkDay = availableDays.includes(day);
    }

    if (isWorkDay && aptCount > 0) {
      classes.push('dr-work-day', 'dr-has-apts')
      return { className: classes.join(' '), style: { borderLeft: '3px solid #059669', background: '#ecfdf5' } }
    }
    if (isWorkDay) {
      classes.push('dr-work-day')
      return { className: classes.join(' '), style: { background: '#f0fdf4' } }
    }
    return { className: 'cal-day-unavailable', style: { background: '#f9fafb' } }
  }

  const closeAndClear = () => {
    closeModal()
    setCitaSeleccionada(null)
  }

  const swrKey = useMemo(() => endpoint ? endpoint : null, [endpoint])
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
          title: `${cita.pacienteNombre || 'Paciente'} - ${cita.hora}`,
          start: fechaBase,
          end: fechaFin,
          estado: cita.estado,
          cita,
        }
      }),
    [effectiveCitas]
  )

  // Eventos de citas del doctor (para vistas week/day)
  const drEvents: EventoCalendario[] = useMemo(() => {
    if (citas && citas.length > 0) return []
    if (!doctorAppointments || doctorAppointments.length === 0) return []
    return doctorAppointments.map((apt, i) => {
      const cleanDate = apt.date_time.replace('Z', '').replace(' ', 'T')
      const start = new Date(cleanDate)
      const end = new Date(start)
      end.setMinutes(end.getMinutes() + 30)
      return {
        id: -(i + 1),
        title: `${apt.patient.user.name}`,
        start, end,
        estado: apt.status.name,
        cita: {
          id: -(i+1),
          doctor: apt.doctor?.user?.name || '',
          especialidad: apt.doctor?.specialty?.name || '',
          fecha: format(start, 'yyyy-MM-dd'),
          hora: format(start, 'HH:mm'),
          estado: apt.status.name,
          pacienteNombre: apt.patient.user.name,
          pacienteId: '',
          motivo: apt.reson_visit || '',
          tipoConsulta: 'Presencial' as const,
        },
      }
    })
  }, [citas, doctorAppointments])

  const allEvents = useMemo(() => [...eventosAdaptados, ...drEvents], [eventosAdaptados, drEvents])

  const onSelectEvent = (evento: EventoCalendario) => {
    setCitaSeleccionada(evento.cita)
    openModal()
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

  const modalActions = useMemo(() => {
    if (!citaSeleccionada) return []

    const ctx: Record<string, string | number | undefined> = {
      role, ...citaSeleccionada, citaId: citaSeleccionada.id, ...context,
    }

    return resolvedActions.map((a) => {
      const variant = a.variant ?? ButtonTheme.SECONDARY

      // 1. Evaluación para enlaces
      if (a.kind === 'link') {
        const href = interpolateTemplate(a.hrefTemplate, ctx)
        const enabled = Boolean(href)
        return {
          id: a.id, label: a.label, variant, enabled,
          onClick: () => {
            if (!enabled) return
            window.location.assign(href)
            closeAndClear()
          },
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
        id: a.id, label: a.label, variant, enabled,
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
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200" style={{ height: heightPx }}>
      <style>{`
        .rbc-btn-group button { color: #374151; border-color: #E5E7EB; }
        .rbc-btn-group .rbc-active { background-color: #EFF6FF; color: #2563EB; box-shadow: none; }
        .rbc-today { background-color: #eff6ff !important; border-left: 3px solid #3b82f6 !important; }
        .rbc-header { padding: 8px 0; font-weight: 600; color: #6B7280; font-size: 0.875rem; text-transform: capitalize;}
        .rbc-event { padding: 2px 5px; cursor: pointer; }
        .rbc-date-cell { position: relative; }
        .rbc-off-range-bg { background: #f9fafb !important; }
        .dr-work-day .rbc-button-link::after { content: ''; display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #10b981; margin-left: 4px; vertical-align: middle; }

        /* Hover fuerte en días seleccionables */
        .cal-day-selectable { cursor: pointer; transition: all 0.15s ease; }
        .cal-day-selectable:hover { background: #dbeafe !important; box-shadow: inset 0 0 0 2px #3b82f6; }

        /* Día no disponible */
        .cal-day-unavailable { opacity: 0.35; cursor: default; }
        .cal-day-unavailable:hover { background: #f9fafb !important; box-shadow: none; }

        /* Día pasado */
        .cal-day-past { opacity: 0.4; cursor: not-allowed; }
        .cal-day-past:hover { box-shadow: none; }

        /* Flash de confirmación al seleccionar */
        @keyframes daySelectedPulse {
          0% { box-shadow: inset 0 0 0 2px #2563eb; background: #bfdbfe; }
          50% { box-shadow: inset 0 0 0 3px #1d4ed8; background: #93c5fd; }
          100% { box-shadow: inset 0 0 0 2px #3b82f6; background: #dbeafe; }
        }
        .cal-day-selected { animation: daySelectedPulse 0.5s ease 2; background: #dbeafe !important; box-shadow: inset 0 0 0 2px #3b82f6; }
      `}</style>

      <Calendar
        style={{ height: '100%' }}
        localizer={localizer}
        events={allEvents}
        startAccessor="start"
        endAccessor="end"
        culture="es"
        date={currentDate}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        messages={mensajesEspanol}
        formats={formatos12h}
        eventPropGetter={aplicarEstilosEvento}
        onSelectEvent={onSelectEvent}
        onSelectSlot={handleSelectSlot}
        dayPropGetter={dayPropGetter}
        selectable
        views={['month', 'week', 'day']}
        defaultView="month"
        step={30}
        showMultiDayTimes
        components={{
          month: {
            dateHeader: ({ date, label }: { date: Date; label: string }) => {
              const dateKey = format(date, 'yyyy-MM-dd')
              const count = appointmentCountByDate[dateKey] || 0
              return (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 4px' }}>
                  <span>{label}</span>
                  {count > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDayListDate(dateKey) }}
                      style={{ background: '#059669', color: 'white', fontSize: '9px', fontWeight: 700, minWidth: '16px', height: '16px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}
                      title={`${count} cita${count > 1 ? 's' : ''} — clic para ver`}
                    >
                      {count}
                    </button>
                  )}
                </div>
              )
            },
          },
        }}
      />

      {/* Modal: listado de citas de un día */}
      <Modal isOpen={!!dayListDate} onClose={() => setDayListDate(null)} title={`Citas del ${dayListDate || ''}`}>
        {dayListDate && (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {(appointmentsByDate[dayListDate] ?? []).length === 0 ? (
              <p className="text-sm text-cool-gray-50 text-center py-4">Sin citas para este día.</p>
            ) : (
              (appointmentsByDate[dayListDate] ?? []).map((apt, i) => {
                const cleanDt = apt.date_time.replace('Z', '').replace(' ', 'T')
                const hora = format(new Date(cleanDt), 'HH:mm')
                const statusColor: Record<string, string> = { Pendiente: 'bg-amber-100 text-amber-800', Confirmada: 'bg-emerald-100 text-emerald-800', Cancelada: 'bg-rose-100 text-rose-800', Finalizada: 'bg-blue-100 text-blue-800' }
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-primary-100 bg-primary-50/30 hover:bg-primary-50 transition-colors">
                    <span className="text-sm font-bold text-primary-800 font-mono w-14 shrink-0">{hora}</span>
                    <span className="text-sm font-medium text-primary-700 flex-1 truncate">{apt.patient.user.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[apt.status.name] || 'bg-slate-100 text-slate-700'}`}>{apt.status.name}</span>
                  </div>
                )
              })
            )}
          </div>
        )}
      </Modal>

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
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha</span>
                <p className="text-sm font-semibold text-slate-700">{citaSeleccionada.fecha}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Horario</span>
                <p className="text-sm font-semibold text-slate-700">{citaSeleccionada.hora}</p>
                <p className="text-xs text-slate-500">Fin aprox: {(() => {
                  const [hh, mm] = (citaSeleccionada.hora || '00:00').split(':').map(Number)
                  const d = new Date(2000, 0, 1, hh || 0, mm || 0)
                  d.setMinutes(d.getMinutes() + 30)
                  return format(d, 'HH:mm')
                })()}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Especialista</span>
                <p className="text-sm font-semibold text-slate-700">{citaSeleccionada.doctor || 'No asignado'}</p>
                <p className="text-sm text-slate-600 truncate">{citaSeleccionada.especialidad || '—'}</p>
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

          </div>
        )}
      </Modal>
    </div>
  )
}
