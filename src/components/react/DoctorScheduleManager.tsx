// DoctorScheduleManager.tsx

import { useState, useCallback } from 'react'
import { Button, ButtonTheme } from '@/components/react/primary/Button'
import { FaCheck, FaMinus, FaPlus, FaXmark } from 'react-icons/fa6'
import type { DoctorSchedConfigOption } from '@/lib/services/medical/doctor/doctor.interface'
import type { DoctorAvailability } from '@/lib/services/scheduling/doctor-availability/doctor_availability.interface'
import { getDoctorAvailability } from '@/lib/services/scheduling/doctor-availability/doctor_availability.service'
import { convertirAHHMM } from '@/utils/helper_functions'

export interface ScheduleDay {
    id?: number
    day_number: number
    starts_at: string
    ends_at: string
}

export interface ScheduleWeek {
    week_number: number
    days: ScheduleDay[]
}

export interface ScheduleCycle {
    id?: number
    employee_id: number
    desc: string
    weeks: ScheduleWeek[]
}

export interface DoctorScheduleManagerProps {
    doctors: DoctorSchedConfigOption[]
}

const WEEKDAYS = [
    { val: 1, label: 'Lunes', short: 'Lun' },
    { val: 2, label: 'Martes', short: 'Mar' },
    { val: 3, label: 'Miércoles', short: 'Mié' },
    { val: 4, label: 'Jueves', short: 'Jue' },
    { val: 5, label: 'Viernes', short: 'Vie' },
    { val: 6, label: 'Sábado', short: 'Sáb' },
    { val: 7, label: 'Domingo', short: 'Dom' },
]

function availabilityToCycle(doctorId: number, availability: DoctorAvailability[]): ScheduleCycle {
    const weekMap = new Map<number, ScheduleDay[]>()

    for (const a of availability) {
        const weekNum = a.week_number ?? 1
        if (!weekMap.has(weekNum)) weekMap.set(weekNum, [])
        weekMap.get(weekNum)!.push({
            id: a.id,
            day_number: a.day_of_week,
            starts_at: convertirAHHMM(a.start_time),
            ends_at: convertirAHHMM(a.end_time),
        })
    }

    const weeks: ScheduleWeek[] = Array.from(weekMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([week_number, days]) => ({
            week_number,
            days: days.sort((a, b) => a.day_number - b.day_number || a.starts_at.localeCompare(b.starts_at)),
        }))

    return {
        employee_id: doctorId,
        desc: 'Ciclo Regular',
        weeks: weeks.length > 0 ? weeks : [{ week_number: 1, days: [] }],
    }
}

function emptyDefaultCycle(doctorId: number): ScheduleCycle {
    return { employee_id: doctorId, desc: 'Ciclo Regular', weeks: [{ week_number: 1, days: [] }] }
}

export default function DoctorScheduleManager({ doctors }: DoctorScheduleManagerProps) {
    const [selectedDocId, setSelectedDocId] = useState<number>(doctors[0]?.id ?? 0)
    const [cycles, setCycles] = useState<Record<number, ScheduleCycle>>({})
    const [loadingDocId, setLoadingDocId] = useState<number | null>(null)
    const [editingCycle, setEditingCycle] = useState<ScheduleCycle | null>(null)
    const [activeWeekTab, setActiveWeekTab] = useState<number>(1)
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const handleSelectDoctor = useCallback(async (docId: number) => {
        if (docId === selectedDocId) return
        setShowSuccess(false)
        setActiveWeekTab(1)
        setSelectedDocId(docId)

        if (cycles[docId]) {
            setEditingCycle(structuredClone(cycles[docId]))
            return
        }

        setLoadingDocId(docId)
        try {
            const availability = await getDoctorAvailability(docId)
            const cycle = availabilityToCycle(docId, availability)
            setCycles(prev => ({ ...prev, [docId]: cycle }))
            setEditingCycle(structuredClone(cycle))
        } catch (err) {
            console.error('Error fetching availability:', err)
            const fallback = emptyDefaultCycle(docId)
            setEditingCycle(fallback)
        } finally {
            setLoadingDocId(null)
        }
    }, [selectedDocId, cycles])

    const [initialFetchDone, setInitialFetchDone] = useState(false)
    if (!initialFetchDone && doctors.length > 0) {
        setInitialFetchDone(true)
        const firstId = doctors[0].id
        setLoadingDocId(firstId)
        getDoctorAvailability(firstId).then(availability => {
            const cycle = availabilityToCycle(firstId, availability)
            setCycles({ [firstId]: cycle })
            setEditingCycle(structuredClone(cycle))
        }).catch(() => {
            setEditingCycle(emptyDefaultCycle(firstId))
        }).finally(() => {
            setLoadingDocId(null)
        })
    }

    const isLoading = loadingDocId === selectedDocId

    const handleWeekCountChange = (count: number) => {
        const newCount = Math.max(1, Math.min(4, count))
        setEditingCycle(prev => {
            if (!prev) return prev
            const newWeeks = [...prev.weeks]
            while (newWeeks.length < newCount) {
                newWeeks.push({ week_number: newWeeks.length + 1, days: [] })
            }
            if (newWeeks.length > newCount) newWeeks.splice(newCount)
            return { ...prev, weeks: newWeeks }
        })
        if (activeWeekTab > newCount) setActiveWeekTab(newCount)
    }

    const handleAddShift = (weekNum: number, dayNum: number) => {
        setEditingCycle(prev => {
            if (!prev) return prev
            const next = { ...prev, weeks: [...prev.weeks] }
            const weekIdx = next.weeks.findIndex(w => w.week_number === weekNum)
            if (weekIdx === -1) return prev
            const week = { ...next.weeks[weekIdx], days: [...next.weeks[weekIdx].days] }
            week.days.push({ day_number: dayNum, starts_at: '08:00', ends_at: '12:00' })
            week.days.sort((a, b) => a.day_number - b.day_number || a.starts_at.localeCompare(b.starts_at))
            next.weeks[weekIdx] = week
            return next
        })
    }

    const handleUpdateShift = (weekNum: number, dayIdx: number, field: 'starts_at' | 'ends_at', val: string) => {
        setEditingCycle(prev => {
            if (!prev) return prev
            const next = { ...prev, weeks: [...prev.weeks] }
            const weekIdx = next.weeks.findIndex(w => w.week_number === weekNum)
            if (weekIdx === -1) return prev
            const week = { ...next.weeks[weekIdx], days: [...next.weeks[weekIdx].days] }
            week.days[dayIdx] = { ...week.days[dayIdx], [field]: val }
            next.weeks[weekIdx] = week
            return next
        })
    }

    const handleRemoveShift = (weekNum: number, dayIdx: number) => {
        setEditingCycle(prev => {
            if (!prev) return prev
            const next = { ...prev, weeks: [...prev.weeks] }
            const weekIdx = next.weeks.findIndex(w => w.week_number === weekNum)
            if (weekIdx === -1) return prev
            const week = { ...next.weeks[weekIdx], days: [...next.weeks[weekIdx].days] }
            week.days.splice(dayIdx, 1)
            next.weeks[weekIdx] = week
            return next
        })
    }

    const handleSave = () => {
        if (!editingCycle) return
        setIsSaving(true)
        setTimeout(() => {
            setCycles(prev => ({ ...prev, [selectedDocId]: structuredClone(editingCycle) }))
            setIsSaving(false)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        }, 600)
    }

    const handleDiscard = () => {
        const saved = cycles[selectedDocId] ?? emptyDefaultCycle(selectedDocId)
        setEditingCycle(structuredClone(saved))
        setActiveWeekTab(1)
    }

    const activeWeek = editingCycle?.weeks.find(w => w.week_number === activeWeekTab)
    const weekCount = editingCycle?.weeks.length ?? 1

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-w-0">

            {/* ── Sidebar ──────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-primary-200 shadow-sm p-4 overflow-hidden flex flex-col gap-3">
                <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wide border-b border-primary-100 pb-2">
                    Seleccionar Médico
                </h3>
                <div className="flex flex-col gap-1 overflow-y-auto max-h-150 pr-1">
                    {doctors.map(doc => (
                        <button
                            key={doc.id}
                            onClick={() => handleSelectDoctor(doc.id)}
                            disabled={loadingDocId !== null}
                            className={`flex flex-col items-start px-3 py-2.5 rounded-lg text-left transition-all border ${doc.id === selectedDocId
                                ? 'bg-primary-50 border-primary-500 shadow-sm'
                                : 'bg-white border-transparent hover:bg-cool-gray-10 hover:border-cool-gray-20'
                            } disabled:opacity-60 disabled:cursor-wait`}
                        >
                            <span className={`font-semibold text-sm ${doc.id === selectedDocId ? 'text-primary-800' : 'text-primary-700'}`}>
                                {doc.user.name}
                            </span>
                            <span className="text-xs text-cool-gray-50">{doc.specialty.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Main Panel ───────────────────────────────────────────────────── */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-primary-200 shadow-sm flex flex-col min-w-0">

                {/* Header toolbar */}
                <div className="p-5 border-b border-primary-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-primary-800 flex items-center gap-2">
                            Configuración de Turnos
                            {showSuccess && (
                                <span className="text-xs bg-green-100 text-success px-2 py-0.5 rounded-full animate-fade-in">
                                    <FaCheck className="mr-1 inline-block" />Guardado
                                </span>
                            )}
                        </h2>
                        <p className="text-sm text-cool-gray-50 mt-1">
                            Configura el ciclo de horarios. Puedes alternar turnos creando ciclos de varias semanas.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center border border-primary-200 rounded-lg overflow-hidden bg-cool-gray-10 px-2 py-1 gap-2">
                            <span className="text-xs font-semibold text-primary-700">Duración del ciclo:</span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleWeekCountChange(weekCount - 1)}
                                    disabled={weekCount <= 1 || isLoading}
                                    className="w-6 h-6 rounded bg-white border border-primary-200 text-primary-700 hover:bg-primary-50 flex items-center justify-center disabled:opacity-50"
                                    aria-label="Disminuir semanas"
                                >
                                    <FaMinus className="text-xs" />
                                </button>
                                <span className="w-4 text-center text-sm font-bold text-primary-800">{weekCount}</span>
                                <span className="text-xs text-primary-700 font-medium">{weekCount === 1 ? 'sem' : 'sems'}</span>
                                <button
                                    onClick={() => handleWeekCountChange(weekCount + 1)}
                                    disabled={weekCount >= 4 || isLoading}
                                    className="w-6 h-6 rounded bg-white border border-primary-200 text-primary-700 hover:bg-primary-50 flex items-center justify-center disabled:opacity-50"
                                    aria-label="Aumentar semanas"
                                >
                                    <FaPlus className="text-xs" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="p-5 flex-1 flex flex-col gap-4 animate-pulse">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-12 rounded-lg bg-cool-gray-10 border border-cool-gray-20" />
                        ))}
                    </div>
                )}

                {/* Week Tabs */}
                {!isLoading && weekCount > 1 && (
                    <div className="px-5 pt-3 border-b border-primary-100 bg-primary-50/50 flex gap-2">
                        {editingCycle!.weeks.map(w => (
                            <button
                                key={w.week_number}
                                onClick={() => setActiveWeekTab(w.week_number)}
                                className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors border-t border-x ${activeWeekTab === w.week_number
                                    ? 'bg-white text-primary-800 border-primary-200 border-b-white translate-y-px z-10'
                                    : 'bg-transparent text-primary-600 border-transparent hover:bg-primary-100'
                                }`}
                            >
                                Semana {w.week_number}
                            </button>
                        ))}
                    </div>
                )}

                {/* Day config list */}
                {!isLoading && (
                    <div className="p-5 flex-1 flex flex-col gap-4">
                        {WEEKDAYS.map(day => {
                            const dayShifts = activeWeek?.days.filter(d => d.day_number === day.val) || []
                            const hasShifts = dayShifts.length > 0

                            return (
                                <div key={day.val} className={`border rounded-lg p-3 transition-colors ${hasShifts ? 'border-primary-200 bg-white shadow-sm' : 'border-cool-gray-20 bg-cool-gray-10/30'}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                        <div className="w-32 flex items-center gap-2 shrink-0 pt-1">
                                            <div className={`w-3 h-3 rounded-full ${hasShifts ? 'bg-primary-500' : 'bg-cool-gray-30'}`}></div>
                                            <span className={`font-bold ${hasShifts ? 'text-primary-800' : 'text-cool-gray-50'}`}>{day.label}</span>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-2">
                                            {dayShifts.map((shift, idx) => {
                                                const realIdx = activeWeek!.days.findIndex(d => d === shift)
                                                return (
                                                    <div key={idx} className="flex flex-wrap items-center gap-2 bg-primary-50 rounded-md p-2 border border-primary-100 animate-fade-in text-sm">
                                                        <input
                                                            type="time"
                                                            value={shift.starts_at}
                                                            onChange={e => handleUpdateShift(activeWeekTab, realIdx, 'starts_at', e.target.value)}
                                                            className="bg-white border border-primary-200 rounded px-2 py-1 text-primary-800 font-medium focus:ring-2 focus:ring-primary-400 outline-none"
                                                            aria-label="Hora de inicio"
                                                        />
                                                        <span className="text-primary-600 font-medium">a</span>
                                                        <input
                                                            type="time"
                                                            value={shift.ends_at}
                                                            onChange={e => handleUpdateShift(activeWeekTab, realIdx, 'ends_at', e.target.value)}
                                                            className="bg-white border border-primary-200 rounded px-2 py-1 text-primary-800 font-medium focus:ring-2 focus:ring-primary-400 outline-none"
                                                            aria-label="Hora de fin"
                                                        />
                                                        <button
                                                            onClick={() => handleRemoveShift(activeWeekTab, realIdx)}
                                                            className="ml-auto w-7 h-7 flex items-center justify-center rounded text-cool-gray-50 hover:text-error hover:bg-red-50 transition-colors"
                                                            title="Eliminar turno"
                                                        >
                                                            <FaXmark />
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                            <div>
                                                <button
                                                    onClick={() => handleAddShift(activeWeekTab, day.val)}
                                                    className={`text-xs font-semibold px-3 py-1.5 rounded-md border border-dashed transition-colors ${hasShifts
                                                        ? 'text-primary-600 border-primary-300 hover:bg-primary-50 hover:border-primary-400 mt-1'
                                                        : 'text-cool-gray-50 border-cool-gray-30 hover:text-primary-600 hover:border-primary-300 w-full text-center hover:bg-white'
                                                    }`}
                                                >
                                                    <FaPlus className="mr-1.5 inline-block" />
                                                    {hasShifts ? 'Añadir otro turno' : 'Habilitar día'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Footer */}
                {!isLoading && (
                    <div className="p-4 border-t border-primary-100 bg-cool-gray-10 flex flex-wrap items-center justify-end gap-3 rounded-b-xl">
                        <Button
                            variant={ButtonTheme.SECONDARY}
                            label="Descartar cambios"
                            onClick={handleDiscard}
                        />
                        <Button
                            variant={ButtonTheme.PRIMARY}
                            loading={isSaving}
                            onClick={handleSave}
                            label={isSaving ? 'Guardando...' : 'Guardar Configuración'}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}