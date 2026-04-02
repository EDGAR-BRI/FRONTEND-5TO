import { useMemo, useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import type { Formats } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addDays, setHours, setMinutes } from 'date-fns'
import { es } from 'date-fns/locale/es'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import { Modal } from '@/components/react/primary/Modal'
import { Button, ButtonTheme } from '@/components/react/primary/Button'
import { useModal } from '@/hooks/UseModal'
import { FaRegCalendarXmark, FaUserDoctor } from 'react-icons/fa6'


export interface DoctorInfo {
  id: number
  name: string
  specialty: string
}

export interface ShiftDay {
  dayOfWeek: number
  startsAt: string  // 'HH:mm'
  endsAt: string    // 'HH:mm'
}

export interface BookedAppointment {
  id: number
  /**'AAAA-MM-DD HH:mm' */
  scheduledStart: string
  scheduledEnd: string
  patientName: string
  reason: string
  status: 'Realizada' | 'Confirmada' | 'Sin Confirmar' | 'Cancelada'
  type: string
  price: string
}

type CalendarEvent = {
  id?: number
  title: string
  start: Date
  end: Date
  resource?: BookedAppointment
}

export interface DoctorScheduleCalendarProps {
  doctors: DoctorInfo[]
  /** shiftsByDoctorId[doctorId] = array of shift day rules for the active ScheduleCycle */
  shiftsByDoctorId: Record<number, ShiftDay[]>
  /** appointmentsByDoctorId[doctorId] = booked appointments */
  appointmentsByDoctorId: Record<number, BookedAppointment[]>
  heightPx?: number
  /** 'week' (default) or 'day' to start the calendar in day view */
  initialView?: 'week' | 'day' | 'agenda'
}

const locales = { es }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

const mensajes = {
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
  noEventsInRange: 'No hay citas registradas.',
}

const formatos: Formats = {
  timeGutterFormat: 'HH:mm',
  eventTimeRangeFormat: ({ start, end }, _culture, loc) =>
    loc ? `${loc.format(start, 'HH:mm', _culture)} – ${loc.format(end, 'HH:mm', _culture)}` : '',
  agendaTimeRangeFormat: ({ start, end }, _culture, loc) =>
    loc ? `${loc.format(start, 'HH:mm', _culture)} – ${loc.format(end, 'HH:mm', _culture)}` : '',
}

const STATUS_COLORS: Record<string, string> = {
  Realizada: '#22c55e',
  Confirmada: '#f59e0b',
  'Sin Confirmar': '#9ca3af',
  Cancelada: '#ef4444',
}

function parseDateTime(str: string): Date {
  return new Date(str.includes('T') ? str : str.replace(' ', 'T'))
}

function buildShiftEvents(shifts: ShiftDay[], referenceDate: Date) {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const events: CalendarEvent[] = []

  for (const shift of shifts) {
    // dayOfWeek:1=Mon…7=Sun → addDays from monday: Mon=0, Tue=1…
    const day = addDays(monday, shift.dayOfWeek - 1)
    const [sh, sm] = shift.startsAt.split(':').map(Number)
    const [eh, em] = shift.endsAt.split(':').map(Number)
    events.push({
      title: 'Turno',
      start: setMinutes(setHours(day, sh), sm),
      end: setMinutes(setHours(day, eh), em),
    })
  }
  return events
}


export default function DoctorScheduleCalendar({
  doctors,
  shiftsByDoctorId,
  appointmentsByDoctorId,
  heightPx = 640,
  initialView = 'week',
}: DoctorScheduleCalendarProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(doctors[0]?.id ?? 0)
  const [referenceDate, setReferenceDate] = useState(new Date())
  const [selectedApt, setSelectedApt] = useState<BookedAppointment | null>(null)
  const { isOpen, openModal, closeModal } = useModal(false)

  // ── Responsive: lock to agenda view on narrow screens ──────────────────
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  const closeAndClear = () => { closeModal(); setSelectedApt(null) }

  const doctor = doctors.find(d => d.id === selectedDoctorId)

  const aptEvents = useMemo(() => {
    const apts = appointmentsByDoctorId[selectedDoctorId] ?? []
    return apts.map<CalendarEvent>(apt => ({
      id: apt.id,
      title: apt.patientName,
      start: parseDateTime(apt.scheduledStart),
      end: parseDateTime(apt.scheduledEnd),
      resource: apt,
    }))
  }, [selectedDoctorId, appointmentsByDoctorId])

  const shiftEvents = useMemo(() => {
    const shifts = shiftsByDoctorId[selectedDoctorId] ?? []
    return buildShiftEvents(shifts, referenceDate)
  }, [selectedDoctorId, shiftsByDoctorId, referenceDate])

  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource?.status ?? ''
    const bg = STATUS_COLORS[status] ?? '#6b7280'
    return {
      style: {
        backgroundColor: bg,
        border: 'none',
        borderRadius: '6px',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '2px 6px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      },
    }
  }

  const onSelectEvent = (event: CalendarEvent) => {
    if (event.resource) {
      setSelectedApt(event.resource)
      openModal()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {doctors.map(doc => (
          <button
            key={doc.id}
            onClick={() => setSelectedDoctorId(doc.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${doc.id === selectedDoctorId
              ? 'bg-primary-700 text-white border-primary-700 shadow-sm'
              : 'bg-white text-primary-800 border-primary-200 hover:bg-primary-50'
              }`}
          >
            <span className="font-semibold">{doc.name}</span>
            <span className={`ml-1.5 text-xs ${doc.id === selectedDoctorId ? 'text-primary-200' : 'text-cool-gray-50'}`}>
              {doc.specialty}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-primary-700">
        <span className="font-semibold text-primary-800">
          <FaUserDoctor className="mr-1 text-primary-500 inline-block" />
          {doctor?.name} — {doctor?.specialty}
        </span>
        <span className="ml-auto flex flex-wrap gap-3">
          {Object.entries(STATUS_COLORS).map(([label, color]) => (
            <span key={label} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded border border-blue-200 bg-blue-50" />
            Turno programado
          </span>
        </span>
      </div>

      <div className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-sm">
        <style>{`
          .rbc-btn-group button { color: #374151; border-color: #E5E7EB; font-size: 0.8rem; }
          .rbc-btn-group .rbc-active { background-color: #EFF6FF; color: #2479BE; box-shadow: none; }
          .rbc-today { background-color: #F8FAFC; }
          .rbc-header { padding: 8px 4px; font-weight: 600; color: #6B7280; font-size: 0.8rem; text-transform: capitalize; }
          .rbc-time-header-content { border-left: 1px solid #e5e7eb; }
          .rbc-background-event { background: #eff6ff !important; border: 1px solid #bae0fd !important; border-radius: 4px !important; opacity: 0.6; color: #072B4A !important; font-size: 0.75rem; font-weight: 600; }
          .rbc-toolbar { padding: 10px 14px; border-bottom: 1px solid #e5e7eb; gap: 8px; flex-wrap: wrap; }
          .rbc-toolbar-label { font-weight: 600; color: #072B4A; font-size: 0.9rem; }
          /* Fix appointment wrapping & text */
          .rbc-event { cursor: pointer; padding: 4px !important; }
          .rbc-event-content { white-space: normal !important; word-wrap: break-word; line-height: 1.2; display: flex; flex-direction: column; gap: 4px; }
          .rbc-event-label { font-size: 0.7rem; opacity: 0.85; margin-bottom: 2px; }
          /* Prettier agenda empty state */
          .rbc-agenda-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; gap: 0.75rem; color: #6B7280; }
        `}</style>

        <Calendar<CalendarEvent, object>
          localizer={localizer}
          events={aptEvents}
          backgroundEvents={shiftEvents}
          startAccessor="start"
          endAccessor="end"
          culture="es"
          messages={{
            ...mensajes,
            noEventsInRange: (
              <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
                  <FaRegCalendarXmark className="text-2xl text-primary-400" />
                </div>
                <p className="text-sm font-semibold text-primary-700">Sin citas registradas</p>
                <p className="text-xs text-cool-gray-50 max-w-xs">No hay citas programadas para este médico en el rango de fechas seleccionado.</p>
              </div>
            ) as unknown as string,
          }}
          formats={formatos}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={onSelectEvent}
          onNavigate={(date) => setReferenceDate(date)}
          views={isMobile ? ['agenda'] : ['week', 'day', 'agenda']}
          defaultView={isMobile ? 'agenda' : initialView}
          key={isMobile ? 'mobile' : 'desktop'}
          step={30}
          timeslots={2}
          min={setMinutes(setHours(new Date(), 6), 0)}
          max={setMinutes(setHours(new Date(), 20), 0)}
          style={{ height: isMobile ? 500 : heightPx }}
          showMultiDayTimes={false}
        />
      </div>

      <Modal isOpen={isOpen} onClose={closeAndClear} title="Detalle de cita">
        {selectedApt && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: STATUS_COLORS[selectedApt.status] ?? '#6b7280' }}
              >
                {selectedApt.status}
              </span>
              <span className="text-cool-gray-50">{selectedApt.type}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-primary-800">
              <div>
                <p className="text-xs text-cool-gray-50 font-medium">Paciente</p>
                <p className="font-semibold">{selectedApt.patientName}</p>
              </div>
              <div>
                <p className="text-xs text-cool-gray-50 font-medium">Precio</p>
                <p className="font-semibold">{selectedApt.price}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-cool-gray-50 font-medium">Motivo</p>
                <p>{selectedApt.reason}</p>
              </div>
              <div>
                <p className="text-xs text-cool-gray-50 font-medium">Inicio</p>
                <p>{selectedApt.scheduledStart}</p>
              </div>
              <div>
                <p className="text-xs text-cool-gray-50 font-medium">Fin</p>
                <p>{selectedApt.scheduledEnd}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-primary-100">
              <Button label="Cerrar" variant={ButtonTheme.GHOST} size="sm" onClick={closeAndClear} />
              <Button label="Gestionar pago" variant={ButtonTheme.PRIMARY} size="sm" onClick={closeAndClear} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
