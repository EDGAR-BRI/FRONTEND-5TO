import { useMemo, useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import type { Formats } from 'react-big-calendar'
import {
  format,
  parse,
  startOfWeek,
  getDay,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  addDays,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday,
  nextSunday,
} from 'date-fns'
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

export interface Doctor {
  id: number | string
  nombre: string
  especialidad: string
}

export interface Paciente {
  id: number | string
  nombre: string
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

// Opciones de fecha para el formulario de nueva/editar cita
export type DatePreset =
  | 'this_week'
  | 'this_month'
  | 'weekday'
  | 'specific'

// Opciones de franja horaria
export type TimeSlot =
  | 'morning'   // 07:00 – 11:59
  | 'afternoon' // 12:00 – 17:59
  | 'evening'   // 18:00 – 21:59
  | 'specific'

const WEEKDAYS = [
  { value: '1', label: 'Lunes' },
  { value: '2', label: 'Martes' },
  { value: '3', label: 'Miércoles' },
  { value: '4', label: 'Jueves' },
  { value: '5', label: 'Viernes' },
  { value: '6', label: 'Sábado' },
  { value: '0', label: 'Domingo' },
]

// Horas disponibles por franja
const MORNING_HOURS = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30']
const AFTERNOON_HOURS = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']
const EVENING_HOURS = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']

const DEFAULT_ESTADOS = ['Pendiente', 'Confirmada', 'Cancelada', 'Finalizada']

export type AppointmentCalendarProps = {
  citas?: Cita[]
  endpoint?: string

  // Endpoints para recepcionista
  doctorsEndpoint?: string
  specialtiesEndpoint?: string   // endpoint independiente: GET → string[]
  patientsEndpoint?: string
  estadosEndpoint?: string       // GET → string[]; si no se pasa usa DEFAULT_ESTADOS o availableEstados

  // Datos estáticos opcionales (alternativa a endpoints)
  doctors?: Doctor[]
  patients?: Paciente[]

  role?: AppointmentCalendarRole

  context?: Record<string, string | number | undefined>
  actions?: CalendarAction[]
  statusClassByEstado?: Record<string, string>
  availableEstados?: string[]    // override total; si no se pasa se intenta estadosEndpoint, luego DEFAULT

  // Endpoint para crear/actualizar citas (recepcionista)
  createEndpoint?: string
  updateEndpoint?: string // template: /api/citas/{citaId}

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

/** Devuelve las fechas disponibles según el preset elegido */
function resolveDateOptions(preset: DatePreset, weekday?: string): Date[] {
  const today = new Date()
  if (preset === 'this_week') {
    const start = startOfWeek(today, { weekStartsOn: 1 })
    const end = endOfWeek(today, { weekStartsOn: 1 })
    const dates: Date[] = []
    let d = start
    while (d <= end) {
      dates.push(new Date(d))
      d = addDays(d, 1)
    }
    return dates
  }
  if (preset === 'this_month') {
    const start = startOfMonth(today)
    const end = endOfMonth(today)
    const dates: Date[] = []
    let d = start
    while (d <= end) {
      dates.push(new Date(d))
      d = addDays(d, 1)
    }
    return dates
  }
  if (preset === 'weekday' && weekday !== undefined) {
    const fns = [nextSunday, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday]
    const idx = parseInt(weekday, 10)
    return [fns[idx](today)]
  }
  return []
}

/** Obtiene las horas disponibles según la franja */
function getHoursForSlot(slot: TimeSlot): string[] {
  if (slot === 'morning') return MORNING_HOURS
  if (slot === 'afternoon') return AFTERNOON_HOURS
  if (slot === 'evening') return EVENING_HOURS
  return []
}

// ─── Sub-componentes internos ─────────────────────────────────────────────────

interface LabelProps { children: React.ReactNode; required?: boolean }
function Label({ children, required }: LabelProps) {
  return (
    <label className="block text-xs font-semibold text-primary-700 mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  required?: boolean
}
function SelectField({ label, required, children, ...props }: SelectProps) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <select
        {...props}
        className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
      >
        {children}
      </select>
    </div>
  )
}

// ─── Formulario de cita (nueva o edición) ─────────────────────────────────────

interface CitaFormProps {
  initialData?: Partial<Cita>
  doctors: Doctor[]
  specialties: string[]          // lista independiente de especialidades
  patients: Paciente[]
  availableEstados: string[]     // vacío → fallback a input libre
  isEdit: boolean
  onSubmit: (data: Partial<Cita>) => Promise<void>
  onCancel: () => void
  loading: boolean
}

function CitaForm({
  initialData,
  doctors,
  specialties,
  patients,
  availableEstados,
  isEdit,
  onSubmit,
  onCancel,
  loading,
}: CitaFormProps) {
  // Estado del formulario
  const [pacienteId, setPacienteId] = useState<string>(String(initialData?.pacienteId ?? ''))
  const [doctorId, setDoctorId] = useState<string>(String(initialData?.doctorId ?? ''))
  const [especialidad, setEspecialidad] = useState<string>(initialData?.especialidad ?? '')
  const [estado, setEstado] = useState<string>(initialData?.estado ?? availableEstados[0] ?? '')
  const [estadoLibre, setEstadoLibre] = useState<string>(initialData?.estado ?? '')

  // Fecha
  const [datePreset, setDatePreset] = useState<DatePreset>('specific')
  const [selectedWeekday, setSelectedWeekday] = useState<string>('1')
  const [selectedDateFromList, setSelectedDateFromList] = useState<string>('')
  const [specificDate, setSpecificDate] = useState<string>(initialData?.fecha ?? '')

  // Hora
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('specific')
  const [selectedHourFromList, setSelectedHourFromList] = useState<string>('')
  const [specificHour, setSpecificHour] = useState<string>(initialData?.hora ?? '')

  // ── Lógica doctor ↔ especialidad ──────────────────────────────────────────

  // Especialidades: unión de la lista independiente + las de los doctores cargados
  const allSpecialties = useMemo(() => {
    const fromDoctors = doctors.map((d) => d.especialidad)
    return [...new Set([...specialties, ...fromDoctors])].sort()
  }, [doctors, specialties])

  // Al seleccionar doctor → auto-fill especialidad (siempre tiene solo una)
  const handleDoctorChange = useCallback(
    (id: string) => {
      setDoctorId(id)
      if (!id) return   // NO resetear especialidad al deseleccionar doctor
      const doc = doctors.find((d) => String(d.id) === id)
      if (doc) setEspecialidad(doc.especialidad)
    },
    [doctors]
  )

  // Al seleccionar especialidad → filtrar doctores; resetear doctor si no pertenece
  const handleEspecialidadChange = useCallback(
    (esp: string) => {
      setEspecialidad(esp)
      if (esp && doctorId) {
        const doc = doctors.find((d) => String(d.id) === doctorId)
        if (doc && doc.especialidad !== esp) setDoctorId('')
      }
    },
    [doctorId, doctors]
  )

  // Doctores filtrados según especialidad seleccionada
  const filteredDoctors = useMemo(() => {
    if (!especialidad) return doctors
    return doctors.filter((d) => d.especialidad === especialidad)
  }, [doctors, especialidad])

  // ── Lógica fecha ──────────────────────────────────────────────────────────

  const dateOptions = useMemo(() => {
    if (datePreset === 'specific') return []
    if (datePreset === 'weekday') return resolveDateOptions('weekday', selectedWeekday)
    return resolveDateOptions(datePreset)
  }, [datePreset, selectedWeekday])

  const resolvedDate = useMemo(() => {
    if (datePreset === 'specific') return specificDate
    if (dateOptions.length === 1) return format(dateOptions[0], 'yyyy-MM-dd')
    return selectedDateFromList
  }, [datePreset, specificDate, dateOptions, selectedDateFromList])

  // ── Lógica hora ───────────────────────────────────────────────────────────

  const hourOptions = useMemo(() => getHoursForSlot(timeSlot), [timeSlot])

  const resolvedHour = useMemo(() => {
    if (timeSlot === 'specific') return specificHour
    return selectedHourFromList
  }, [timeSlot, specificHour, selectedHourFromList])

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const doc = doctors.find((d) => String(d.id) === doctorId)
    const resolvedEstado = availableEstados.length > 0 ? estado : estadoLibre
    await onSubmit({
      ...(initialData ?? {}),
      pacienteId: pacienteId || undefined,
      paciente: patients.find((p) => String(p.id) === pacienteId)?.nombre,
      doctorId: doctorId || undefined,
      doctor: doc?.nombre ?? '',
      especialidad,
      fecha: resolvedDate,
      hora: resolvedHour,
      estado: resolvedEstado,
    })
  }

  const isValid = Boolean(resolvedDate && resolvedHour && (doctorId || especialidad))

  return (
    <div className="space-y-4">
      {/* Paciente */}
      {patients.length > 0 && (
        <SelectField
          label="Paciente"
          required
          value={pacienteId}
          onChange={(e) => setPacienteId(e.target.value)}
        >
          <option value="">— Seleccionar paciente —</option>
          {patients.map((p) => (
            <option key={p.id} value={String(p.id)}>{p.nombre}</option>
          ))}
        </SelectField>
      )}

      {/* Especialidad (con opción "Cualquiera") */}
      <SelectField
        label="Especialidad"
        value={especialidad}
        onChange={(e) => handleEspecialidadChange(e.target.value)}
      >
        <option value="">Cualquiera</option>
        {allSpecialties.map((esp) => (
          <option key={esp} value={esp}>{esp}</option>
        ))}
      </SelectField>

      {/* Doctor */}
      <SelectField
        label="Doctor"
        value={doctorId}
        onChange={(e) => handleDoctorChange(e.target.value)}
      >
        <option value="">— Seleccionar doctor —</option>
        {filteredDoctors.map((d) => (
          <option key={d.id} value={String(d.id)}>{d.nombre}</option>
        ))}
      </SelectField>

      {/* Estado (solo edición) */}
      {isEdit && (
        <div>
          {availableEstados.length > 0 ? (
            <SelectField
              label="Estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              {availableEstados.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </SelectField>
          ) : (
            <div>
              <Label>Estado</Label>
              <input
                type="text"
                value={estadoLibre}
                onChange={(e) => setEstadoLibre(e.target.value)}
                placeholder="Ej: Pendiente, Confirmada…"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Fecha ─────────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-3">
        <Label required>Fecha</Label>

        {/* Chips de preset */}
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { value: 'this_week', label: 'Esta semana' },
              { value: 'this_month', label: 'Este mes' },
              { value: 'weekday', label: 'Día de semana' },
              { value: 'specific', label: 'Fecha específica' },
            ] as { value: DatePreset; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setDatePreset(opt.value); setSelectedDateFromList(''); setSpecificDate('') }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                datePreset === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Selector de día de la semana */}
        {datePreset === 'weekday' && (
          <SelectField
            label="Día"
            value={selectedWeekday}
            onChange={(e) => { setSelectedWeekday(e.target.value); setSelectedDateFromList('') }}
          >
            {WEEKDAYS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </SelectField>
        )}

        {/* Lista de fechas para this_week / this_month / weekday (cuando tiene varias) */}
        {dateOptions.length > 1 && (
          <div>
            <Label required>Selecciona el día</Label>
            <div className="grid grid-cols-4 gap-1 max-h-36 overflow-y-auto">
              {dateOptions.map((d) => {
                const val = format(d, 'yyyy-MM-dd')
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSelectedDateFromList(val)}
                    className={`rounded-md py-1 px-1 text-xs text-center transition-colors ${
                      selectedDateFromList === val
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-white border border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <div className="font-medium capitalize">{format(d, 'EEE', { locale: es })}</div>
                    <div>{format(d, 'd MMM', { locale: es })}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Fecha única (weekday con próximo día) */}
        {dateOptions.length === 1 && (
          <div className="text-xs text-blue-700 font-medium bg-blue-50 rounded px-2 py-1">
            📅 {format(dateOptions[0], "EEEE d 'de' MMMM", { locale: es })}
          </div>
        )}

        {/* Input de fecha específica */}
        {datePreset === 'specific' && (
          <input
            type="date"
            value={specificDate}
            min={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => setSpecificDate(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}
      </div>

      {/* ── Hora ──────────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-3">
        <Label required>Hora</Label>

        {/* Chips de franja */}
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { value: 'morning', label: '🌅 Mañana', sub: '7 – 12' },
              { value: 'afternoon', label: '☀️ Tarde', sub: '12 – 18' },
              { value: 'evening', label: '🌆 Noche', sub: '18 – 21' },
              { value: 'specific', label: '🕐 Específica', sub: '' },
            ] as { value: TimeSlot; label: string; sub: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setTimeSlot(opt.value); setSelectedHourFromList(''); setSpecificHour('') }}
              className={`flex flex-col items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                timeSlot === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              <span>{opt.label}</span>
              {opt.sub && <span className="opacity-70 text-[10px]">{opt.sub}</span>}
            </button>
          ))}
        </div>

        {/* Grid de horas para franja */}
        {hourOptions.length > 0 && (
          <div className="grid grid-cols-5 gap-1">
            {hourOptions.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setSelectedHourFromList(h)}
                className={`rounded-md py-1 text-xs text-center font-medium transition-colors ${
                  selectedHourFromList === h
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 hover:border-blue-300 text-gray-700'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        )}

        {/* Input hora específica */}
        {timeSlot === 'specific' && (
          <input
            type="time"
            value={specificHour}
            step={1800}
            onChange={(e) => setSpecificHour(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-2 pt-1">
        <Button label="Cancelar" variant={ButtonTheme.GHOST} size="sm" onClick={onCancel} disabled={loading} />
        <Button
          label={isEdit ? 'Guardar cambios' : 'Crear cita'}
          variant={ButtonTheme.PRIMARY}
          size="sm"
          disabled={!isValid || loading}
          loading={loading}
          onClick={handleSubmit}
        />
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AppointmentCalendar({
  citas,
  endpoint,
  doctorsEndpoint,
  specialtiesEndpoint,
  patientsEndpoint,
  estadosEndpoint,
  doctors: doctorsProp,
  patients: patientsProp,
  role = 'pacient',
  context,
  actions,
  statusClassByEstado,
  availableEstados,
  createEndpoint,
  updateEndpoint,
  heightPx = 600,
}: AppointmentCalendarProps) {
  const isReceptionist = role === 'receptionist' || role === 'admin'

  // ── Modal state ────────────────────────────────────────────────────────────
  // Modal A: detalle / edición de cita existente
  const { isOpen: isDetailOpen, openModal: openDetail, closeModal: closeDetail } = useModal(false)
  // Modal B: nueva cita (separado, como pide el diseño)
  const { isOpen: isCreateOpen, openModal: openCreate, closeModal: closeCreate } = useModal(false)

  const [modalMode, setModalMode] = useState<'detail' | 'edit'>('detail')
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const closeAndClear = useCallback(() => {
    closeDetail()
    setCitaSeleccionada(null)
    setModalMode('detail')
  }, [closeDetail])

  // ── Datos de citas ─────────────────────────────────────────────────────────
  const swrKey = endpoint ?? null
  const { data: citasFromEndpoint, mutate } = useSWR<Cita[]>(swrKey, fetcher)
  const effectiveCitas = citas ?? citasFromEndpoint ?? []

  // ── Datos de doctores ──────────────────────────────────────────────────────
  const { data: doctorsFromEndpoint } = useSWR<Doctor[]>(
    isReceptionist && doctorsEndpoint ? doctorsEndpoint : null,
    fetcher
  )
  const effectiveDoctors: Doctor[] = doctorsProp ?? doctorsFromEndpoint ?? []

  // ── Especialidades independientes ──────────────────────────────────────────
  const { data: specialtiesFromEndpoint } = useSWR<string[]>(
    isReceptionist && specialtiesEndpoint ? specialtiesEndpoint : null,
    fetcher
  )
  const effectiveSpecialties: string[] = specialtiesFromEndpoint ?? []

  // ── Datos de pacientes ─────────────────────────────────────────────────────
  const { data: patientsFromEndpoint } = useSWR<Paciente[]>(
    isReceptionist && patientsEndpoint ? patientsEndpoint : null,
    fetcher
  )
  const effectivePatients: Paciente[] = patientsProp ?? patientsFromEndpoint ?? []

  // ── Estados disponibles ────────────────────────────────────────────────────
  // Prioridad: prop > endpoint > default hardcoded
  const { data: estadosFromEndpoint } = useSWR<string[]>(
    isReceptionist && !availableEstados && estadosEndpoint ? estadosEndpoint : null,
    fetcher
  )
  const effectiveEstados: string[] =
    availableEstados ?? estadosFromEndpoint ?? DEFAULT_ESTADOS

  // ── Eventos para el calendario ─────────────────────────────────────────────
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

  // ── Estilos de eventos ─────────────────────────────────────────────────────
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

  // ── Selección de evento ────────────────────────────────────────────────────
  const onSelectEvent = (evento: EventoCalendario) => {
    setCitaSeleccionada(evento.cita)
    setModalMode('detail')
    openDetail()
  }

  // ── Actions por defecto ────────────────────────────────────────────────────
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

  // ── Modal actions (para roles sin formulario) ──────────────────────────────
  const modalActions = useMemo(() => {
    if (!citaSeleccionada) return []
    const ctx: Record<string, string | number | undefined> = {
      role,
      ...citaSeleccionada,
      citaId: citaSeleccionada.id,
      ...context,
    }
    return resolvedActions.map((a) => {
      const variant = a.variant ?? ButtonTheme.SECONDARY
      if (a.kind === 'link') {
        const href = interpolateTemplate(a.hrefTemplate, ctx)
        const enabled = Boolean(href)
        return {
          id: a.id, label: a.label, variant, enabled,
          onClick: () => { if (!enabled) return; window.location.assign(href); closeAndClear() },
        }
      }
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

  // ── Formulario submit ──────────────────────────────────────────────────────
  const handleFormSubmit = async (data: Partial<Cita>, mode: 'create' | 'edit') => {
    setFormLoading(true)
    try {
      if (mode === 'create' && createEndpoint) {
        const response = await api(createEndpoint, {
          method: 'POST',
          body: JSON.stringify(data),
        })
        if (response.ok) { await mutate(); closeCreate() }
      } else if (mode === 'edit' && updateEndpoint && citaSeleccionada) {
        const ctx = { citaId: citaSeleccionada.id, ...context }
        const ep = interpolateTemplate(updateEndpoint, ctx as Record<string, string | number | undefined>)
        if (ep) {
          const response = await api(ep, {
            method: 'PATCH',
            body: JSON.stringify(data),
          })
          if (response.ok) { await mutate(); closeAndClear() }
        }
      }
    } finally {
      setFormLoading(false)
    }
  }

  // ── Modal titles ───────────────────────────────────────────────────────────
  const detailModalTitle = modalMode === 'edit' ? 'Editar Cita' : (citaSeleccionada ? 'Detalle de Cita' : 'Cita')

  return (
    <div className="w-full bg-white p-4" style={{ height: heightPx + (isReceptionist ? 52 : 0) }}>
      <style>{`
        .rbc-btn-group button { color: #374151; border-color: #E5E7EB; }
        .rbc-btn-group .rbc-active { background-color: #EFF6FF; color: #2563EB; box-shadow: none; }
        .rbc-today { background-color: #F8FAFC; }
        .rbc-header { padding: 8px 0; font-weight: 600; color: #6B7280; font-size: 0.875rem; text-transform: capitalize; }
      `}</style>

      {/* Barra de recepcionista */}
      {isReceptionist && (
        <div className="flex justify-end mb-3">
          <Button
            label="+ Nueva Cita"
            variant={ButtonTheme.PRIMARY}
            size="sm"
            onClick={openCreate}
          />
        </div>
      )}

      <Calendar
        style={{ height: heightPx }}
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

      {/* ── Modal A: Detalle / Edición de cita existente ───────────────────── */}
      <Modal isOpen={isDetailOpen} onClose={closeAndClear} title={detailModalTitle}>
        {modalMode === 'detail' && citaSeleccionada && (
          <div className="space-y-4">
            <div className="space-y-1">
              {citaSeleccionada.paciente && (
                <div className="text-xs font-medium text-primary-500">
                  Paciente: <span className="text-primary-900">{citaSeleccionada.paciente}</span>
                </div>
              )}
              <div className="text-sm text-primary-900 font-semibold">{citaSeleccionada.doctor}</div>
              <div className="text-sm text-primary-700">{citaSeleccionada.especialidad}</div>
              <div className="text-xs text-primary-700">
                {citaSeleccionada.fecha} · {citaSeleccionada.hora}
              </div>
              <div className="text-xs text-primary-700">Estado: {citaSeleccionada.estado}</div>
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
              {isReceptionist && (
                <Button
                  label="Editar"
                  variant={ButtonTheme.SECONDARY}
                  size="sm"
                  onClick={() => setModalMode('edit')}
                />
              )}
              <Button label="Cerrar" variant={ButtonTheme.GHOST} size="sm" onClick={closeAndClear} />
            </div>
          </div>
        )}

        {modalMode === 'edit' && isReceptionist && citaSeleccionada && (
          <CitaForm
            initialData={citaSeleccionada}
            doctors={effectiveDoctors}
            specialties={effectiveSpecialties}
            patients={effectivePatients}
            availableEstados={effectiveEstados}
            isEdit
            onSubmit={(data) => handleFormSubmit(data, 'edit')}
            onCancel={closeAndClear}
            loading={formLoading}
          />
        )}
      </Modal>

      {/* ── Modal B: Nueva Cita (modal separado) ──────────────────────────── */}
      {isReceptionist && (
        <Modal isOpen={isCreateOpen} onClose={closeCreate} title="Nueva Cita">
          <CitaForm
            doctors={effectiveDoctors}
            specialties={effectiveSpecialties}
            patients={effectivePatients}
            availableEstados={effectiveEstados}
            isEdit={false}
            onSubmit={(data) => handleFormSubmit(data, 'create')}
            onCancel={closeCreate}
            loading={formLoading}
          />
        </Modal>
      )}
    </div>
  )
}