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
import AppointmentVoucherModal from '@/components/react/pacient/AppointmentVoucherModal'

import { getDrsSelect } from '@/lib/services/medical/doctor/doctor.service'
import { getPatients } from '@/lib/services/medical/patient/patient.service'
import { getAppointmentTypes } from '@/lib/services/scheduling/appointment-type/appointment_type.service'
import { createAppointment } from '@/lib/services/scheduling/appointment/appointment.service'
import type { DoctorSchedConfigOption } from '@/lib/services/medical/doctor/doctor.interface'
import type { Patient } from '@/lib/services/medical/patient/patient.interface'
import type { AppointmentType } from '@/lib/services/scheduling/appointment-type/appointment_type.interface'
import type { DoctorAvailability } from '@/lib/services/scheduling/doctor-availability/doctor_availability.interface'
import type { Appointment } from '@/lib/services/scheduling/appointment/appointment.interface'
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
    createEndpoint?: string
    onSuccess?: () => void
    onError?: (err: unknown) => void
    context?: Record<string, string | number | undefined>
    role?: "receptionist" | "pacient"
    userId?: string | number
    externalDate?: string
    onDoctorChange?: (doctorId: string | number) => void
    doctorSchedule?: DoctorAvailability[]
    doctorAppointments?: Appointment[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveDateOptions(preset: DatePreset, weekday?: string, workDays?: number[]): Date[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let rawDates: Date[] = []

    if (preset === 'this_week') {
        const start = startOfWeek(today, { weekStartsOn: 1 })
        const end = endOfWeek(today, { weekStartsOn: 1 })
        let d = start
        while (d <= end) { rawDates.push(new Date(d)); d = addDays(d, 1) }
    } else if (preset === 'this_month') {
        const start = startOfMonth(today)
        const end = endOfMonth(today)
        let d = start
        while (d <= end) { rawDates.push(new Date(d)); d = addDays(d, 1) }
    } else if (preset === 'weekday' && weekday !== undefined) {
        const fns = [nextSunday, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday]
        rawDates = [fns[parseInt(weekday, 10)](new Date())]
    }

    return rawDates.filter(d => {
        const dateOnly = new Date(d)
        dateOnly.setHours(0, 0, 0, 0)
        if (dateOnly < today) return false
        if (workDays && workDays.length > 0) {
            return workDays.includes(dateOnly.getDay())
        }
        return true
    })
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
    role,
    userId,
    externalDate,
    onDoctorChange,
    doctorSchedule = [],
    doctorAppointments = [],
}: AppointmentFormProps) {

    // ── Remote data ──────────────────────────────────────────────────────────
    const [doctors, setDoctors] = useState<DoctorSchedConfigOption[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
    const [dataLoading, setDataLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const [drs, pats, types] = await Promise.all([
                    getDrsSelect(),
                    getPatients(),
                    getAppointmentTypes()
                ])
                if (!cancelled) {
                    setDoctors(drs)
                    setPatients(pats)
                    setAppointmentTypes(types)
                }
            } catch (err) {
                console.error('Error cargando datos del formulario:', err)
            } finally {
                if (!cancelled) setDataLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

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
        doctors.map(d => ({ value: d.id, label: `${d.user.name} - ${d.user.ci}` })),
        [doctors]
    )

    const filteredPatientOptions: SelectOption[] = useMemo(() => {
        let filtered = patients;
        if (role === 'pacient' && context?.patientId) {
            filtered = patients.filter(p => String(p.id) === String(context.patientId));
        } else if (role === 'pacient' && userId) {
            filtered = patients.filter(p => String(p.userId) === String(userId));
        }
        return filtered.map(p => ({ value: p.id, label: `${p.name} - ${p.ci}` }))
    }, [patients, role, userId, context?.patientId])

    const appointmentTypeOptions: SelectOption[] = useMemo(() => {
        return appointmentTypes.map(t => ({ value: t.id, label: t.name }))
    }, [appointmentTypes])

    // ── Form state ───────────────────────────────────────────────────────────
    const [especialidad, setEspecialidad] = useState<string | number>('')
    const [doctorId, setDoctorId] = useState<string | number>('')
    const [patientId, setPatientId] = useState<string | number>(context?.patientId || '')
    const [appointmentTypeId, setAppointmentTypeId] = useState<string | number>('')
    const [motivo, setMotivo] = useState('')
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
    
    // 👇 Estados para el Voucher 
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [voucherData, setVoucherData] = useState<any>(null);

    // ── Fecha ────────────────────────────────────────────────────────────────
    const [datePreset, setDatePreset] = useState<DatePreset>('specific')
    const [selectedWeekday, setSelectedWeekday] = useState<string | number>('1')
    const [selectedDateFromList, setSelectedDateFromList] = useState('')
    const [specificDate, setSpecificDate] = useState('')

    const [dateFlash, setDateFlash] = useState(false)

    const workDays = useMemo(() => {
        if (!doctorSchedule || doctorSchedule.length === 0) return undefined
        return Array.from(new Set(doctorSchedule.map(s => s.day_of_week)))
    }, [doctorSchedule])

    const filteredWeekdays = useMemo(() => {
        if (!workDays) return WEEKDAYS
        return WEEKDAYS.filter(w => workDays.includes(Number(w.value)))
    }, [workDays])

    const dateOptions = useMemo(() => {
        if (datePreset === 'specific') return []
        if (datePreset === 'weekday') return resolveDateOptions('weekday', String(selectedWeekday), workDays)
        return resolveDateOptions(datePreset, undefined, workDays)
    }, [datePreset, selectedWeekday, workDays])

    useEffect(() => {
        if (externalDate) {
            setDatePreset('specific')
            setSpecificDate(externalDate)
            setDateFlash(true)
            setTimeout(() => setDateFlash(false), 1200)
        }
    }, [externalDate])

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

    const doctorTimeRange = useMemo(() => {
        if (!doctorSchedule || doctorSchedule.length === 0 || !resolvedDate) return null
        let dayOfWeek: number | null = null
        if (/^\d{4}-\d{2}-\d{2}$/.test(resolvedDate)) {
            const d = new Date(resolvedDate + 'T00:00:00')
            dayOfWeek = d.getDay()
        }
        if (dayOfWeek === null) return null
        const schedForDay = doctorSchedule.filter(s => s.day_of_week === dayOfWeek)
        if (schedForDay.length === 0) return null
        const starts = schedForDay.map(s => {
            const clean = s.start_time.replace('Z', '').substring(11, 16)
            return clean || s.start_time.substring(0, 5)
        })
        const ends = schedForDay.map(s => {
            const clean = s.end_time.replace('Z', '').substring(11, 16)
            return clean || s.end_time.substring(0, 5)
        })
        return { start: starts.sort()[0], end: ends.sort().reverse()[0] }
    }, [doctorSchedule, resolvedDate])

    const hourOptions = useMemo(() => {
        let hours = getHoursForSlot(timeSlot)
        const todayStr = format(new Date(), 'yyyy-MM-dd')
        if (resolvedDate === todayStr) {
            const currentHourStr = format(new Date(), 'HH:mm')
            hours = hours.filter(h => h > currentHourStr)
        }
        if (doctorTimeRange) {
            hours = hours.filter(h => h >= doctorTimeRange.start && h < doctorTimeRange.end)
        }
        if (resolvedDate && doctorAppointments.length > 0) {
            const dateStr = resolvedDate 
            const occupiedStarts = doctorAppointments
                .filter(apt => {
                    const cleanDate = apt.date_time.replace('Z', '').replace(' ', 'T')
                    return cleanDate.startsWith(dateStr) && apt.status.name !== 'Cancelada'
                })
                .map(apt => {
                    const cleanDate = apt.date_time.replace('Z', '').replace(' ', 'T')
                    return format(new Date(cleanDate), 'HH:mm')
                })
            
            hours = hours.filter(h => {
                const [h_hh, h_mm] = h.split(':').map(Number)
                const optTime = h_hh * 60 + h_mm
                for (const occ of occupiedStarts) {
                    const [o_hh, o_mm] = occ.split(':').map(Number)
                    const occTime = o_hh * 60 + o_mm
                    if (Math.abs(optTime - occTime) < 15) {
                        return false 
                    }
                }
                return true
            })
        }
        return hours
    }, [timeSlot, resolvedDate, doctorTimeRange, doctorAppointments])

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
            .map(d => ({ value: d.id, label: `${d.user.name} - ${d.user.ci}` }))
    }, [doctors, doctorOptionsAll, especialidad])

    const handleEspecialidadChange = useCallback((val: string | number) => {
        setEspecialidad(val)
        if (val && doctorId) {
            const doc = doctors.find(d => d.id === Number(doctorId))
            if (doc && doc.specialty.name !== String(val)) {
                setDoctorId('')
            }
        }
    }, [doctorId, doctors])

    const handleDoctorChange = useCallback((val: string | number) => {
        setDoctorId(val)
        if (val) {
            const doc = doctors.find(d => d.id === Number(val))
            if (doc) setEspecialidad(doc.specialty.name)
        }
        onDoctorChange?.(val)
    }, [doctors, onDoctorChange])

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
        patientId &&
        appointmentTypeId &&
        resolvedDate &&
        resolvedHour
    )

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!isValid) return
        setLoading(true)
        setFeedback(null)

        const horaFinal = resolvedHour === 'Cualquiera' ? '08:00' : resolvedHour;
        const dateTimeString = `${resolvedDate}T${horaFinal}:00`;
        const dateObj = new Date(dateTimeString);
        const now = new Date();

        // Validaciones de fecha pasada 
        if (resolvedHour === 'Cualquiera') {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const selectedDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
            if (selectedDay < today) {
                setFeedback({ type: 'error', msg: 'No se puede pautar una cita en una fecha pasada.' });
                setLoading(false);
                return;
            }
        } else {
            if (dateObj < now) {
                setFeedback({ type: 'error', msg: 'No se puede pautar una cita en una fecha y hora pasada.' });
                setLoading(false);
                return;
            }
        }

        try {
            const selectedDoctor = doctors.find(d => d.id === Number(doctorId));
            const consultationPrice = selectedDoctor?.specialty.consultation_price || 0;
            const dateTimeUTC = `${resolvedDate}T${horaFinal}:00.000Z`;

            // Enviamos a la BD
            await createAppointment({
                patientId: Number(patientId),
                doctorId: Number(doctorId),
                date_time: dateTimeUTC,
                reson_visit: motivo || undefined,
                statusId: 1,
                typeId: Number(appointmentTypeId),
                price: consultationPrice
            });

            // Buscamos el nombre del paciente para el voucher
            const patientName = filteredPatientOptions.find(p => String(p.value) === String(patientId))?.label || 'Paciente';

            // Preparamos datos del comprobante y lo abrimos
            setVoucherData({
                patientName: patientName.split(' - ')[0],
                doctorName: selectedDoctor?.user.name || 'Doctor',
                specialty: selectedDoctor?.specialty.name || 'Consulta General',
                date: resolvedDate,
                time: horaFinal,
                price: consultationPrice
            });

            setFeedback({ type: 'success', msg: 'Cita pautada correctamente. Pendiente de confirmación en caja.' })
            setIsVoucherModalOpen(true);
            // El onSuccess y el reset del motivo lo hacemos cuando el usuario cierre el Voucher

        } catch (err: any) {
            console.error('Error creando cita:', err)
            setFeedback({ type: 'error', msg: err.message || 'No se pudo pautar la cita. Intenta de nuevo.' })
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
                    
                    {/* ── Paciente ── */}
                    {role !== 'pacient' && (
                        <SearchableSelect
                            label="Paciente *"
                            placeholder={filteredPatientOptions.length === 0 ? 'Sin pacientes disponibles' : '— Seleccionar paciente —'}
                            options={filteredPatientOptions}
                            value={patientId}
                            onChange={(val) => setPatientId(val)}
                            name="patient"
                            searchPlaceholder="Buscar paciente por nombre o CI…"
                        />
                    )}

                    {/* ── Tipo de Cita ── */}
                    <Select
                        label="Tipo de Cita *"
                        placeholder="— Seleccionar tipo —"
                        options={appointmentTypeOptions}
                        value={appointmentTypeId}
                        onChange={(val) => setAppointmentTypeId(val)}
                        name="appointmentType"
                    />

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
                                options={filteredWeekdays}
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
                            <div className={dateFlash ? 'date-field-flash' : ''} key={dateFlash ? 'flash' : 'idle'}>
                                <Field
                                    name="specificDate"
                                    type="date"
                                    value={specificDate}
                                    onChange={(e) => setSpecificDate(e.target.value)}
                                    placeholder="Selecciona una fecha"
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                />
                                <style>{`
                                    @keyframes dateFieldPulse {
                                        0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.5); }
                                        40% { box-shadow: 0 0 0 6px rgba(37,99,235,0.25); }
                                        100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
                                    }
                                    .date-field-flash { animation: dateFieldPulse 0.6s ease 2; border-radius: 8px; }
                                `}</style>
                            </div>
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

                        {/* Indicador de horario del doctor */}
                        {doctorTimeRange && (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2.5 py-1.5">
                                <span>🩺</span>
                                <span>Horario del doctor: <strong>{doctorTimeRange.start}</strong> – <strong>{doctorTimeRange.end}</strong></span>
                            </div>
                        )}

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
                                type="time"
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
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60"
                            style={{ animation: 'toastSlideUpCenter 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        >
                            <div className={`px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${feedback.type === 'success'
                                ? 'bg-emerald-600 text-white border-emerald-500/50'
                                : 'bg-rose-600 text-white border-rose-500/50'
                                }`}>
                                <span className={`rounded-full w-6 h-6 flex items-center justify-center text-[12px] font-bold shadow-inner ${feedback.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                    {feedback.type === 'success' ? '✓' : '!'}
                                </span>
                                <span className="text-sm font-medium">{feedback.msg}</span>
                                <button 
                                    onClick={() => setFeedback(null)}
                                    className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
                                    type="button"
                                >
                                    ✕
                                </button>
                            </div>
                            <style>{`
                                @keyframes toastSlideUpCenter { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
                            `}</style>
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

                    
                    <AppointmentVoucherModal 
                        isOpen={isVoucherModalOpen}
                        onClose={() => {
                            setIsVoucherModalOpen(false);
                            onSuccess?.();
                            setMotivo('');
                            setVoucherData(null);
                        }}
                        appointmentData={voucherData}
                    />

                </div>
            )}
        </StaticCard>
    )
}