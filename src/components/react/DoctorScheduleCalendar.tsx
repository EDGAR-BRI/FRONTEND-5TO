import { useMemo, useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import type { Formats } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addDays, setHours, setMinutes } from 'date-fns'
import { es } from 'date-fns/locale/es'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import { Modal } from '@/components/react/primary/Modal'
import { Button, ButtonTheme } from '@/components/react/primary/Button'
import { useModal } from '@/hooks/UseModal'
import { FaRegCalendarXmark, FaUserDoctor, FaPencil } from 'react-icons/fa6'
import { Select } from '@/components/react/primary/Select'
import { SearchableSelect } from '@/components/react/primary/SearchableSelect'
import type { DoctorSchedConfigOption } from "@/lib/services/medical/doctor/doctor.interface";
import { getAppointmentsByDr, updateAppointment } from '@/lib/services/scheduling/appointment/appointment.service'
import { listConsultationsByDoctor } from '@/lib/services/medical/consultation/consultation.service'
import type { ConsultationSummary } from '@/lib/services/medical/consultation/consultation.interface'
import { getAppointmentStatuses } from '@/lib/services/scheduling/appointment-status/appointment_status.service'
import { formatAppointmentsByDoctorId, convertirAHHMM } from '@/utils/helper_functions'
import { Alert } from '@/utils/alerts'


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
  status: string
  statusId: number
  doctorId: number
  type: string
  price: string
  /** True when this event represents a medical consultation, not a regular appointment */
  isConsultation?: boolean
}

type CalendarEvent = {
  id?: number
  title: string
  start: Date
  end: Date
  resource?: BookedAppointment
}

export interface DoctorScheduleCalendarProps {
  doctors: DoctorSchedConfigOption[]
  allSchedules: { id: number, doctorId: number, period_start: string, period_end: string | null }[]
  allAvailabilities: { doctorScheduleId?: number, day_of_week: number, start_time: string, end_time: string }[]
  heightPx?: number
  initialView?: 'month' | 'week' | 'day' | 'agenda'
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
  Pendiente: '#9ca3af',
  Cancelada: '#ef4444',
}

function parseDateTime(str: string): Date {
  // Para evitar desfases por zona horaria al mostrar citas (Literal UTC):
  // Eliminamos la 'Z' para que el navegador lo parsee como hora local y se vea exactamente lo guardado.
  const cleanStr = str.replace('Z', '').replace(' ', 'T')
  return new Date(cleanStr)
}




export default function DoctorScheduleCalendar({
  doctors,
  allSchedules,
  allAvailabilities,
  heightPx = 640,
  initialView = 'week',
  selectedDoctorId: controlledDocId,
  onDoctorSelect,
  loadingSchedules = false,
}: DoctorScheduleCalendarProps) {
  // Support both controlled (prop) and uncontrolled (internal) selection
  const [internalDocId, setInternalDocId] = useState<number | null>(null)
  const isControlled = controlledDocId !== undefined
  const selectedDoctorId = isControlled ? controlledDocId : internalDocId

  const handleDoctorPillClick = (docId: number) => {
    if (!isControlled) setInternalDocId(docId)
    onDoctorSelect?.(docId)
  }

  const [referenceDate, setReferenceDate] = useState(new Date())
  const [selectedApt, setSelectedApt] = useState<BookedAppointment | null>(null)
  const { isOpen, openModal, closeModal } = useModal(false)

  // ── Appointments fetch por doctor ───────────────────────────────────────
  const [appointmentsByDoctorId, setAppointmentsByDoctorId] = useState<Record<number, BookedAppointment[]>>({})
  const [consultationsByDoctorId, setConsultationsByDoctorId] = useState<Record<number, ConsultationSummary[]>>({})
  const [loadingApts, setLoadingApts] = useState(false)

  // ── Edición de Cita ───────────────────────────────────────
  const [isEditingDoctor, setIsEditingDoctor] = useState(false)
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [statuses, setStatuses] = useState<any[]>([])
  const [updatingApt, setUpdatingApt] = useState(false)
  const [selectedEditStatusId, setSelectedEditStatusId] = useState<number | string>('')
  const [selectedEditDoctorId, setSelectedEditDoctorId] = useState<number | string>('')

  useEffect(() => {
    if (isOpen) {
      getAppointmentStatuses().then(setStatuses).catch(console.error)
    } else {
      setIsEditingDoctor(false)
      setIsEditingStatus(false)
    }
  }, [isOpen])

  /** Clear cached appointments for the current doctor and re-fetch */
  const refetchAppointments = async () => {
    if (selectedDoctorId === null || selectedDoctorId === 0) return
    setLoadingApts(true)
    try {
      const [raw, consultations] = await Promise.all([
        getAppointmentsByDr(selectedDoctorId),
        listConsultationsByDoctor(selectedDoctorId).catch(() => [] as ConsultationSummary[]),
      ])
      const formatted = formatAppointmentsByDoctorId(raw)
      setAppointmentsByDoctorId(prev => ({
        ...prev,
        [selectedDoctorId!]: formatted[selectedDoctorId!] ?? [],
      }))
      setConsultationsByDoctorId(prev => ({
        ...prev,
        [selectedDoctorId!]: consultations,
      }))
    } catch (err) {
      console.error('Error re-fetching appointments:', err)
    } finally {
      setLoadingApts(false)
    }
  }

  /** Called immediately when the user picks a new status from the dropdown */
  const handleStatusChange = async (appointmentId: number, newStatusId: number | string) => {
    if (!newStatusId) return
    setUpdatingApt(true)
    try {
      await updateAppointment(appointmentId, { statusId: Number(newStatusId) })
      setIsEditingStatus(false)
      // Update the selectedApt in-place so the modal reflects the change
      const newStatus = statuses.find(s => s.id === Number(newStatusId))
      if (selectedApt && newStatus) {
        setSelectedApt({ ...selectedApt, status: newStatus.name, statusId: newStatus.id })
      }
      await refetchAppointments()
      await Alert.success('Estado actualizado', 'El estado de la cita fue actualizado exitosamente.')
    } catch (e: any) {
      console.error(e)
      await Alert.error('Error al actualizar estado', e?.message || 'Ocurrió un error inesperado.')
    } finally {
      setUpdatingApt(false)
    }
  }

  const saveDoctor = async (appointmentId: number) => {
    if (!selectedEditDoctorId) return
    const targetDoctorId = Number(selectedEditDoctorId)
    setUpdatingApt(true)
    try {
      await updateAppointment(appointmentId, { doctorId: targetDoctorId })
      setIsEditingDoctor(false)
      // Invalidate cached appointments/consultations for the target doctor so they refresh on selection
      setAppointmentsByDoctorId(prev => {
        const next = { ...prev }
        delete next[targetDoctorId]
        return next
      })
      setConsultationsByDoctorId(prev => {
        const next = { ...prev }
        delete next[targetDoctorId]
        return next
      })
      await refetchAppointments()
      await Alert.success('Médico actualizado', 'El médico de la cita fue actualizado exitosamente.')
    } catch (e: any) {
      console.error(e)
      await Alert.error('Error al actualizar médico', e?.message || 'Ocurrió un error inesperado.')
    } finally {
      setUpdatingApt(false)
    }
  }

  useEffect(() => {
    // Don't fetch if no doctor selected
    if (selectedDoctorId === null || selectedDoctorId === 0) return
    // Si ya están cacheados, no volver a pedir
    if (appointmentsByDoctorId[selectedDoctorId]) return

    setLoadingApts(true)
    Promise.all([
      getAppointmentsByDr(selectedDoctorId),
      listConsultationsByDoctor(selectedDoctorId).catch(() => [] as ConsultationSummary[]),
    ])
      .then(([raw, consultations]) => {
        const formatted = formatAppointmentsByDoctorId(raw)
        setAppointmentsByDoctorId(prev => ({
          ...prev,
          [selectedDoctorId!]: formatted[selectedDoctorId!] ?? [],
        }))
        setConsultationsByDoctorId(prev => ({
          ...prev,
          [selectedDoctorId!]: consultations,
        }))
      })
      .catch(err => console.error('Error fetching appointments:', err))
      .finally(() => setLoadingApts(false))
  }, [selectedDoctorId])

  // ── Responsive ──────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const closeAndClear = () => { closeModal(); setSelectedApt(null) }
  const doctor = selectedDoctorId !== null ? doctors.find(d => d.id === selectedDoctorId) : null

  const aptEvents = useMemo(() => {
    if (selectedDoctorId === null || selectedDoctorId === 0) return []
    const apts = appointmentsByDoctorId[selectedDoctorId] ?? []
    const consultations = consultationsByDoctorId[selectedDoctorId] ?? []

    // Build a set of "patientId|dateKey" from consultations so we can suppress overlapping appointments
    const consultationKeys = new Set<string>()
    for (const c of consultations) {
      const patientId = c.invoice?.patient?.id
      if (!patientId || !c.date) continue
      const dateKey = c.date.replace('Z', '').replace(' ', 'T').slice(0, 16) // 'YYYY-MM-DDTHH:mm'
      consultationKeys.add(`${patientId}|${dateKey}`)
    }

    // Filter out appointments that are covered by a consultation (same patient + same date/time)
    const filteredApts = apts.filter(apt => {
      const cleanStart = apt.scheduledStart.replace('Z', '').replace(' ', 'T').slice(0, 16)
      // We need the patient ID — extract from patientName won't work, let's use a broader match on date only
      // Since BookedAppointment doesn't carry patientId, we match by patientName + dateKey
      // Actually, let's check if any consultation matches this exact start time (same doctor is implicit)
      for (const c of consultations) {
        const cDateKey = c.date.replace('Z', '').replace(' ', 'T').slice(0, 16)
        const cPatientName = c.invoice?.patient?.user?.name
        if (cDateKey === cleanStart && cPatientName && cPatientName === apt.patientName) {
          return false // suppress this appointment — the consultation takes precedence
        }
      }
      return true
    })

    // Map remaining appointments to calendar events
    const appointmentEvents: CalendarEvent[] = filteredApts.map(apt => ({
      id: apt.id,
      title: apt.patientName,
      start: parseDateTime(apt.scheduledStart),
      end: parseDateTime(apt.scheduledEnd),
      resource: apt,
    }))

    // Map consultations to calendar events with 'Realizada' status
    const consultationEvents: CalendarEvent[] = consultations.map(c => {
      const start = parseDateTime(c.date)
      const end = new Date(start.getTime() + 30 * 60_000) // 30 min default
      const patientName = c.invoice?.patient?.user?.name || 'Paciente'
      return {
        id: c.id,
        title: `${patientName} (Consulta)`,
        start,
        end,
        resource: {
          id: c.id,
          scheduledStart: c.date,
          scheduledEnd: end.toISOString(),
          patientName,
          reason: 'Consulta médica',
          status: 'Realizada',
          statusId: -1, // Consultations don't have an appointment statusId
          doctorId: c.doctorId,
          type: 'Consulta',
          price: c.invoice?.total_usd ? `$${c.invoice.total_usd}` : '—',
          isConsultation: true,
        } as BookedAppointment,
      }
    })

    return [...appointmentEvents, ...consultationEvents]
  }, [selectedDoctorId, appointmentsByDoctorId, consultationsByDoctorId])

  const shiftEvents = useMemo(() => {
    if (selectedDoctorId === null || selectedDoctorId === 0) return []
    const monday = startOfWeek(referenceDate, { weekStartsOn: 1 })
    const events: CalendarEvent[] = []
    const docSchedules = allSchedules.filter(s => s.doctorId === selectedDoctorId)

    // Para la semana que se está viendo, calculamos el turno de cada día (7 días)
    for (let i = 0; i < 7; i++) {
      const date = addDays(monday, i)
      // Buscamos el schedule activo para esta fecha en específico
      const dateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
      const dayOfWeek = date.getDay()

      const activeSchedule = docSchedules
        .map(s => ({ ...s, _start: new Date(s.period_start), _end: s.period_end ? new Date(s.period_end) : null }))
        .filter(s => s._start <= dateUTC && (s._end === null || s._end >= dateUTC))
        .sort((a, b) => b._start.getTime() - a._start.getTime())[0]

      if (activeSchedule) {
        const avails = allAvailabilities.filter(a => a.doctorScheduleId === activeSchedule.id && a.day_of_week === dayOfWeek)
        for (const a of avails) {
          const startsAt = convertirAHHMM(a.start_time)
          const endsAt = convertirAHHMM(a.end_time)
          const [sh, sm] = startsAt.split(':').map(Number)
          const [eh, em] = endsAt.split(':').map(Number)
          events.push({
            title: 'Turno',
            start: setMinutes(setHours(date, sh), sm),
            end: setMinutes(setHours(date, eh), em),
          })
        }
      }
    }
    return events
  }, [selectedDoctorId, allSchedules, allAvailabilities, referenceDate])

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
      {/* Doctor selector — sin cambios */}

      {/* Loading indicator */}
      {loadingApts && (
        <div className="text-xs text-primary-500 flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-primary-400 inline-block" />
          Cargando citas...
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {doctors.map(doc => (
          <button
            key={doc.id}
            onClick={() => handleDoctorPillClick(doc.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${doc.id === selectedDoctorId
              ? 'bg-primary-700 text-white border-primary-700 shadow-sm'
              : 'bg-white text-primary-800 border-primary-200 hover:bg-primary-50'
              }`}
          >
            <span className="font-semibold">{doc.user.name}</span>
            <span className={`ml-1.5 text-xs ${doc.id === selectedDoctorId ? 'text-primary-200' : 'text-cool-gray-50'}`}>
              {doc.specialty.name}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-primary-700">
        {doctor ? (
          <span className="font-semibold text-primary-800">
            <FaUserDoctor className="mr-1 text-primary-500 inline-block" />
            {doctor.user.name} — {doctor.specialty.name}
          </span>
        ) : (
          <span className="font-medium text-cool-gray-50 italic">
            Selecciona un médico para ver sus citas
          </span>
        )}
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
          views={isMobile ? ['agenda'] : ['month', 'week', 'day', 'agenda']}
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

      <Modal isOpen={isOpen} onClose={closeAndClear} title={selectedApt?.isConsultation ? 'Detalle de consulta' : 'Detalle de cita'}>
        {selectedApt && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 min-h-[28px]">
              {isEditingStatus ? (
                <div className="flex items-center gap-2 bg-white rounded-md p-1 border border-primary-200">
                  <div className="w-48">
                    <Select
                      options={statuses.filter(s => s.id !== 2 && s.id !== 4).map(s => ({ value: s.id, label: s.name }))}
                      value={selectedEditStatusId}
                      onChange={(val) => handleStatusChange(selectedApt.id, val)}
                      name="status"
                    />
                  </div>
                  {updatingApt && <span className="text-xs text-primary-500 animate-pulse">Guardando...</span>}
                  <button onClick={() => setIsEditingStatus(false)} disabled={updatingApt} className="text-xs font-bold text-cool-gray-50 hover:text-cool-gray-70 px-2">✕</button>
                </div>
              ) : (
                <>
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: STATUS_COLORS[selectedApt.status] ?? '#6b7280' }}
                  >
                    {selectedApt.status}
                    {!selectedApt.isConsultation && selectedApt.statusId !== 2 && (
                      <button onClick={() => { setIsEditingStatus(true); setSelectedEditStatusId(selectedApt.statusId) }} className="hover:text-white/80 bg-black/10 rounded-full p-1" title="Cambiar estado">
                        <FaPencil className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </span>
                  <span className="text-cool-gray-50">{selectedApt.type}</span>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-primary-800">
              <div className="col-span-2">
                <p className="text-xs text-cool-gray-50 font-medium">Médico Especialista</p>
                {isEditingDoctor ? (
                  <div className="flex flex-col gap-2 mt-1 bg-white rounded-md p-2 border border-primary-200">
                    <SearchableSelect
                      options={doctors.map(d => ({ value: d.id, label: `${d.user.name} — C.I. ${d.user.ci || 'N/A'}` }))}
                      value={selectedEditDoctorId}
                      onChange={(val) => setSelectedEditDoctorId(val)}
                      placeholder="Buscar médico..."
                      searchPlaceholder="Buscar por cédula o nombre..."
                      name="doctor"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setIsEditingDoctor(false)} disabled={updatingApt} className="text-xs font-bold text-cool-gray-50 hover:text-cool-gray-70">Cancelar</button>
                      <button onClick={() => saveDoctor(selectedApt.id)} disabled={updatingApt} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Guardar</button>
                    </div>
                  </div>
                ) : (
                  <p className="font-semibold flex items-center gap-2">
                    {doctor?.user.name || 'Médico de la cita'}
                    {!selectedApt.isConsultation && selectedApt.statusId !== 2 && (
                      <button onClick={() => { setIsEditingDoctor(true); setSelectedEditDoctorId(selectedApt.doctorId || selectedDoctorId || '') }} className="inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-md px-1.5 py-0.5 transition-colors" title="Cambiar médico">
                        <FaPencil className="w-2.5 h-2.5" /> Cambiar
                      </button>
                    )}
                  </p>
                )}
              </div>
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
                <p>{convertirAHHMM(selectedApt.scheduledStart)}</p>
              </div>
              <div>
                <p className="text-xs text-cool-gray-50 font-medium">Fin</p>
                <p>{convertirAHHMM(selectedApt.scheduledEnd)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-primary-100">
              <Button label="Cerrar" variant={ButtonTheme.GHOST} size="sm" onClick={closeAndClear} />
              {!selectedApt.isConsultation && selectedApt.status === 'Pendiente' && (
                <Button label="Gestionar pago" variant={ButtonTheme.PRIMARY} size="sm" disabled={isEditingDoctor || isEditingStatus} onClick={() => {
                  closeAndClear();
                  const url = new URL(window.location.href);
                  const pathParts = url.pathname.split('/').filter(Boolean);
                  if (pathParts.includes('receptionist')) {
                      pathParts[pathParts.length - 1] = 'invoice';
                      url.pathname = '/' + pathParts.join('/');
                      url.searchParams.set('appointmentId', selectedApt.id.toString());
                      window.location.href = url.toString();
                  }
                }} />
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
