import { useState, useMemo, useCallback, useEffect } from 'react'
import {
    format,
    addDays,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    nextMonday,
    nextTuesday,
    nextWednesday,
    nextThursday,
    nextFriday,
    nextSaturday,
    nextSunday,
} from 'date-fns'
import { es } from 'date-fns/locale/es'

import { api } from '@/lib/api'
import { Select } from '@/components/react/primary/Select'
import { SearchableSelect } from '@/components/react/primary/SearchableSelect'
import { Field } from '@/components/react/primary/Field'
import { Button, ButtonTheme } from '@/components/react/primary/Button'
import StaticCard from '@/components/react/primary/StaticCard'
import { FaCalendarPlus } from 'react-icons/fa6'

import { getDrsSelect } from '@/lib/services/medical/doctor/doctor.service'
import type { DoctorSchedConfigOption } from '@/lib/services/medical/doctor/doctor.interface'
import type { SelectOption } from '@/components/react/primary/Select'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DatePreset = 'this_week' | 'this_month' | 'weekday' | 'specific'
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'any' | 'specific'

const WEEKDAYS: SelectOption[] = [
    { value: '1', label: 'Lunes' },
    { value: '2', label: 'Martes' },
    { value: '3', label: 'Miércoles' },
    { value: '4', label: 'Jueves' },
    { value: '5', label: 'Viernes' },
    { value: '6', label: 'Sábado' },
    { value: '0', label: 'Domingo' },
]

const MORNING_HOURS = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30']
const AFTERNOON_HOURS = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']
const EVENING_HOURS = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']

export interface AppointmentFormProps {
    /** Endpoint de creación de cita */
    createEndpoint?: string

    /** Callbacks */
    onSuccess?: () => void
    onError?: (err: unknown) => void

    /** Contexto extra enviado en el body (ej: patientId) */
    context?: Record<string, string | number | undefined>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveDateOptions(preset: DatePreset, weekday?: string): Date[] {
    const today = new Date()
    if (preset === 'this_week') {
        const start = startOfWeek(today, { weekStartsOn: 1 })
        const end = endOfWeek(today, { weekStartsOn: 1 })
        const dates: Date[] = []
        let d = start
        while (d <= end) { dates.push(new Date(d)); d = addDays(d, 1) }
        return dates
    }
    if (preset === 'this_month') {
        const start = startOfMonth(today)
        const end = endOfMonth(today)
        const dates: Date[] = []
        let d = start
        while (d <= end) { dates.push(new Date(d)); d = addDays(d, 1) }
        return dates
    }
    if (preset === 'weekday' && weekday !== undefined) {
        const fns = [nextSunday, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday]
        return [fns[parseInt(weekday, 10)](today)]
    }
    return []
}

function getHoursForSlot(slot: TimeSlot): string[] {
    if (slot === 'morning') return MORNING_HOURS
    if (slot === 'afternoon') return AFTERNOON_HOURS
    if (slot === 'evening') return EVENING_HOURS
    return []
}

// ─── Sub‑components ───────────────────────────────────────────────────────────

type ChipProps = {
    active: boolean
    onClick: () => void
    children: React.ReactNode
    sub?: string
}

function Chip({ active, onClick, children, sub }: ChipProps) {
    return (
        <button
            type="button"
            onClick={(e) => { e.preventDefault(); onClick() }}
            className={`flex flex-col items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${active
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-primary-100 text-primary-700 border-primary-300 hover:border-primary-60 hover:text-primary-600'
                }`}
        >
            <span>{children}</span>
            {sub && <span className={`text-[10px] mt-0.5 ${active ? 'opacity-80' : 'opacity-60'}`}>{sub}</span>}
        </button>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AppointmentForm({
    createEndpoint,
    onSuccess,
    onError,
    context,
}: AppointmentFormProps) {

    // ── Remote data ──────────────────────────────────────────────────────────
    const [doctors, setDoctors] = useState<DoctorSchedConfigOption[]>([])
    const [dataLoading, setDataLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const drs = await getDrsSelect()
                if (!cancelled) setDoctors(drs)
            } catch (err) {
                console.error('Error cargando datos del formulario:', err)
            } finally {
                if (!cancelled) setDataLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    // Derive unique specialties from doctor data
    const specialtyOptions: SelectOption[] = useMemo(() => {
        const seen = new Set<string>()
        const opts: SelectOption[] = [{ value: '', label: 'Cualquiera' }]
        doctors
            .filter(d => {
                if (seen.has(d.specialty.name)) return false
                seen.add(d.specialty.name)
                return true
            })
            .sort((a, b) => a.specialty.name.localeCompare(b.specialty.name))
            .forEach(d => opts.push({ value: d.specialty.name, label: d.specialty.name }))
        return opts
    }, [doctors])

    const doctorOptionsAll: SelectOption[] = useMemo(() =>
        doctors.map(d => ({ value: d.id, label: d.user.name })),
        [doctors]
    )

    // ── Form state ───────────────────────────────────────────────────────────
    const [especialidad, setEspecialidad] = useState<string | number>('')
    const [doctorId, setDoctorId] = useState<string | number>('')
    const [motivo, setMotivo] = useState('')
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

    // ── Fecha ────────────────────────────────────────────────────────────────
    const [datePreset, setDatePreset] = useState<DatePreset>('specific')
    const [selectedWeekday, setSelectedWeekday] = useState<string | number>('1')
    const [selectedDateFromList, setSelectedDateFromList] = useState('')
    const [specificDate, setSpecificDate] = useState('')

    const dateOptions = useMemo(() => {
        if (datePreset === 'specific') return []
        if (datePreset === 'weekday') return resolveDateOptions('weekday', String(selectedWeekday))
        return resolveDateOptions(datePreset)
    }, [datePreset, selectedWeekday])

    const resolvedDate = useMemo(() => {
        if (datePreset === 'specific') return specificDate
        if (datePreset === 'weekday') {
            const day = WEEKDAYS.find(w => w.value === selectedWeekday)
            return day ? day.label : ''
        }
        return selectedDateFromList
    }, [datePreset, specificDate, selectedWeekday, selectedDateFromList])

    // ── Hora ─────────────────────────────────────────────────────────────────
    const [timeSlot, setTimeSlot] = useState<TimeSlot>('specific')
    const [selectedHourFromList, setSelectedHourFromList] = useState('')
    const [specificHour, setSpecificHour] = useState('')

    const hourOptions = useMemo(() => getHoursForSlot(timeSlot), [timeSlot])

    const resolvedHour = useMemo(() => {
        if (timeSlot === 'any') return 'Cualquiera'
        if (timeSlot === 'specific') return specificHour
        return selectedHourFromList
    }, [timeSlot, specificHour, selectedHourFromList])

    // ── Doctor ↔ Especialidad ────────────────────────────────────────────────
    const filteredDoctorOptions: SelectOption[] = useMemo(() => {
        if (!especialidad) return doctorOptionsAll
        return doctors
            .filter(d => d.specialty.name === String(especialidad))
            .map(d => ({ value: d.id, label: d.user.name }))
    }, [doctors, doctorOptionsAll, especialidad])

    const handleEspecialidadChange = useCallback((val: string | number) => {
        setEspecialidad(val)
        // Si el doctor seleccionado no pertenece a esta especialidad, resetear
        if (val && doctorId) {
            const doc = doctors.find(d => d.id === Number(doctorId))
            if (doc && doc.specialty.name !== String(val)) {
                setDoctorId('')
            }
        }
    }, [doctorId, doctors])

    const handleDoctorChange = useCallback((val: string | number) => {
        setDoctorId(val)
        // Auto-seleccionar la especialidad del doctor
        if (val) {
            const doc = doctors.find(d => d.id === Number(val))
            if (doc) setEspecialidad(doc.specialty.name)
        }
    }, [doctors])

    // ── Preset change handlers ───────────────────────────────────────────────
    const handleDatePresetChange = (preset: DatePreset) => {
        setDatePreset(preset)
        setSelectedDateFromList('')
        setSpecificDate('')
        if (preset === 'weekday') setSelectedWeekday('1')
    }

    const handleTimeSlotChange = (slot: TimeSlot) => {
        setTimeSlot(slot)
        setSelectedHourFromList('')
        setSpecificHour('')
    }

    // ── Validation ───────────────────────────────────────────────────────────
    const isValid = Boolean(
        (doctorId || especialidad) &&
        resolvedDate &&
        resolvedHour
    )

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!isValid || !createEndpoint) return
        setLoading(true)
        setFeedback(null)
        try {
            const horaFinal = resolvedHour === 'Cualquiera' ? '08:00' : resolvedHour;
            const dateTimeString = `${resolvedDate}T${horaFinal}:00`;
            const dateObj = new Date(dateTimeString);


            const payload: Record<string, any> = {
                patientId: Number(context?.patientId),
                //doctorId: Number(doctorId),
                date_time: dateObj.toISOString(),
                reson_visit: motivo || undefined,
                statusId: 1,
                typeId: 1,
                price: 50,
            }
            if (doctorId) {
                payload.doctorId = Number(doctorId);
            } else if (especialidad) {
                // Si no eligió doctor pero sí especialidad, enviamos specialtyId
                // Ojo: asegúrate de que 'especialidad' guarde el ID y no el nombre
                payload.specialtyId = Number(especialidad);
            }

            const res = await api(createEndpoint, {
                method: 'POST',
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                setFeedback({ type: 'success', msg: 'Cita pautada correctamente. Pendiente de confirmación.' })
                onSuccess?.()

                setMotivo('')
            } else {
                const errorData = await res.json().catch(() => ({}));
                setFeedback({ type: 'error', msg: errorData.message || 'No se pudo pautar la cita. Intenta de nuevo.' })
            }
        } catch (err) {
            setFeedback({ type: 'error', msg: 'Error de conexión con el servidor.' })
            onError?.(err)
        } finally {
            setLoading(false)
        }
    }

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <StaticCard className="lg:col-span-1 flex flex-col gap-1">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                    <FaCalendarPlus className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-primary-900">Nueva Cita</h2>
            </div>

            {dataLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-300 border-t-primary" />
                    <span className="ml-2 text-sm text-primary-600">Cargando datos…</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* ── Especialidad ── */}
                    <Select
                        label="Especialidad"
                        placeholder="Cualquiera"
                        options={specialtyOptions}
                        value={especialidad}
                        onChange={handleEspecialidadChange}
                        name="especialidad"
                    />

                    {/* ── Doctor ── */}
                    <SearchableSelect
                        label="Doctor"
                        placeholder={filteredDoctorOptions.length === 0 ? 'Sin doctores disponibles' : '— Seleccionar doctor —'}
                        options={filteredDoctorOptions}
                        value={doctorId}
                        onChange={handleDoctorChange}
                        name="doctor"
                        searchPlaceholder="Buscar doctor…"
                    />

                    {/* ── Fecha ── */}
                    <div className="rounded-lg border border-primary-300 bg-primary-50/50 p-3 space-y-3">
                        <label className="block text-sm font-medium text-primary-700">
                            Fecha <span className="text-red-500 ml-0.5">*</span>
                        </label>

                        <div className="flex flex-wrap gap-1.5">
                            <Chip active={datePreset === 'this_week'} onClick={() => handleDatePresetChange('this_week')}>Esta semana</Chip>
                            <Chip active={datePreset === 'this_month'} onClick={() => handleDatePresetChange('this_month')}>Este mes</Chip>
                            <Chip active={datePreset === 'weekday'} onClick={() => handleDatePresetChange('weekday')}>Día específico</Chip>
                            <Chip active={datePreset === 'specific'} onClick={() => handleDatePresetChange('specific')}>Fecha específica</Chip>
                        </div>

                        {/* Selector de día específico */}
                        {datePreset === 'weekday' && (
                            <Select
                                label="Día"
                                options={WEEKDAYS}
                                value={selectedWeekday}
                                onChange={(val) => setSelectedWeekday(val)}
                                name="weekday"
                            />
                        )}

                        {/* Grid de días (this_week / this_month) */}
                        {datePreset !== 'weekday' && datePreset !== 'specific' && dateOptions.length > 0 && (
                            <div>
                                <p className="text-xs text-primary-500 mb-1.5">Selecciona el día</p>
                                <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto pr-0.5">
                                    {dateOptions.map(d => {
                                        const val = format(d, 'yyyy-MM-dd')
                                        const isSelected = selectedDateFromList === val
                                        return (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setSelectedDateFromList(val) }}
                                                className={`rounded-lg py-1.5 px-1 text-center text-xs transition-all border ${isSelected
                                                    ? 'bg-primary text-white border-primary font-semibold'
                                                    : 'bg-primary-100 border-primary-200 hover:border-primary-60 text-primary-700'
                                                    }`}
                                            >
                                                <div className="font-medium capitalize leading-tight">
                                                    {format(d, 'EEE', { locale: es })}
                                                </div>
                                                <div className="leading-tight">
                                                    {format(d, 'd MMM', { locale: es })}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Input fecha específica */}
                        {datePreset === 'specific' && (
                            <Field
                                name="specificDate"
                                type="date"
                                value={specificDate}
                                onChange={(e) => setSpecificDate(e.target.value)}
                                placeholder="Selecciona una fecha"
                            />
                        )}
                    </div>

                    {/* ── Hora ── */}
                    <div className="rounded-lg border border-primary-300 bg-primary-50/50 p-3 space-y-3">
                        <label className="block text-sm font-medium text-primary-700">
                            Hora <span className="text-red-500 ml-0.5">*</span>
                        </label>

                        <div className="flex flex-wrap gap-1.5">
                            <Chip active={timeSlot === 'morning'} sub="7 – 12" onClick={() => handleTimeSlotChange('morning')}>🌅 Mañana</Chip>
                            <Chip active={timeSlot === 'afternoon'} sub="12 – 18" onClick={() => handleTimeSlotChange('afternoon')}>☀️ Tarde</Chip>
                            <Chip active={timeSlot === 'evening'} sub="18 – 21" onClick={() => handleTimeSlotChange('evening')}>🌆 Noche</Chip>
                            <Chip active={timeSlot === 'any'} onClick={() => handleTimeSlotChange('any')}>🔄 Cualquiera</Chip>
                            <Chip active={timeSlot === 'specific'} onClick={() => handleTimeSlotChange('specific')}>🕐 Específica</Chip>
                        </div>

                        {/* Grid de horas por franja */}
                        {hourOptions.length > 0 && (
                            <div className="grid grid-cols-4 gap-1">
                                {hourOptions.map(h => (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() => setSelectedHourFromList(h)}
                                        className={`rounded-lg py-1.5 text-xs text-center font-medium border transition-all ${selectedHourFromList === h
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-primary-100 border-primary-200 hover:border-primary-60 text-primary-700'
                                            }`}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Cualquiera info */}
                        {timeSlot === 'any' && (
                            <div className="flex items-center gap-2 text-sm text-primary-700 font-medium bg-primary-100 border border-primary-200 rounded-lg px-3 py-2">
                                <span>🔄</span>
                                <span>Se asignará la hora según disponibilidad del doctor.</span>
                            </div>
                        )}

                        {/* Input hora específica */}
                        {timeSlot === 'specific' && (
                            <Field
                                name="specificHour"
                                type="text"
                                placeholder="Ej: 10:30"
                                value={specificHour}
                                onChange={(e) => setSpecificHour(e.target.value)}
                            />
                        )}
                    </div>

                    {/* ── Motivo ── */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-sm text-primary-700 px-1">
                            Motivo <span className="text-primary-400 text-xs font-normal">(Opcional)</span>
                        </label>
                        <textarea
                            rows={2}
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ej: Chequeo de rutina…"
                            className="w-full bg-primary-100 border border-primary-300 rounded-md px-4 py-2 text-sm text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-60/10 focus:border-primary-60/40 hover:border-primary-60/60 transition-all duration-200 resize-none"
                        />
                    </div>

                    {/* ── Feedback ── */}
                    {feedback && (
                        <div
                            className={`text-xs px-3 py-2 rounded-lg border ${feedback.type === 'success'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                                }`}
                        >
                            {feedback.msg}
                        </div>
                    )}

                    {/* ── Submit ── */}
                    <Button
                        label={loading ? 'Pautando…' : 'Pautar Cita'}
                        variant={ButtonTheme.PRIMARY}
                        size="lg"
                        adaptive
                        disabled={!isValid || loading}
                        loading={loading}
                        onClick={handleSubmit}
                        className="mt-1"
                    />
                </div>
            )}
        </StaticCard>
    )
}