import { useState, useEffect, useCallback } from 'react'
import { Spinner } from '@/components/react/primary/Spinner'
import { FaRegCalendarXmark, FaArrowsRotate } from 'react-icons/fa6'
import DoctorScheduleCalendar from './DoctorScheduleCalendar'
import type { DoctorSchedConfigOption } from '@/lib/services/medical/doctor/doctor.interface'
import type { DoctorSchedule } from '@/lib/services/scheduling/doctor-schedule/doctor_schedule.interface'
import type { DoctorAvailability } from '@/lib/services/scheduling/doctor-availability/doctor_availability.interface'
import { getDoctorsBySchedule, getDoctorSchedules } from '@/lib/services/scheduling/doctor-schedule/doctor_schedule.service'
import { getDoctorAvailabilitiesByScheduleId } from '@/lib/services/scheduling/doctor-availability/doctor_availability.service'
import { convertirAHHMM } from '@/utils/helper_functions'

export interface ShiftDay {
  dayOfWeek: number
  startsAt: string
  endsAt: string
}

export interface DoctorScheduleCalendarWrapperProps {
  initialView: 'month' | 'week' | 'day' | 'agenda'
}

/** Returns { mondayISO, sundayISO } for the current week */
/** Formats a Date as DD-MM-YYYY using local time for the backend parseDate function */
function toLocalDDMMYYYY(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${d}-${m}-${y}`
}

function getCurrentWeekRange() {
  const today = new Date()
  const dow = today.getDay()
  const diffToMonday = dow === 0 ? -6 : 1 - dow
  const monday = new Date(today)
  monday.setDate(today.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    monday,
    mondayISO: toLocalDDMMYYYY(monday),
    sundayISO: toLocalDDMMYYYY(sunday),
  }
}

/**
 * From an array of DoctorSchedule (which may overlap by period) and a flat
 * array of their availabilities, resolve the active schedule for each day
 * of the week and extract shifts.
 */
function buildShiftsFromSchedules(
  schedules: DoctorSchedule[],
  avails: DoctorAvailability[],
  monday: Date,
): ShiftDay[] {
  const shifts: ShiftDay[] = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const dateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
    const dayOfWeek = date.getDay()

    // Find the active schedule for this specific date (most recent period_start wins)
    const activeSchedule = schedules
      .map(s => {
        const ps = new Date(s.period_start);
        const _start = new Date(Date.UTC(ps.getUTCFullYear(), ps.getUTCMonth(), ps.getUTCDate(), 0, 0, 0, 0));
        let _end: Date | null = null;
        if (s.period_end) {
          const pe = new Date(s.period_end);
          _end = new Date(Date.UTC(pe.getUTCFullYear(), pe.getUTCMonth(), pe.getUTCDate(), 0, 0, 0, 0));
        }
        return { ...s, _start, _end };
      })
      .filter(s => s._start <= dateUTC && (s._end === null || s._end >= dateUTC))
      .sort((a, b) => b._start.getTime() - a._start.getTime())[0]

    if (activeSchedule) {
      const dayAvails = avails.filter(a => a.doctorScheduleId === activeSchedule.id && a.day_of_week === dayOfWeek)
      for (const a of dayAvails) {
        shifts.push({
          dayOfWeek: a.day_of_week,
          startsAt: convertirAHHMM(a.start_time),
          endsAt: convertirAHHMM(a.end_time),
        })
      }
    }
  }

  return shifts
}

export default function DoctorScheduleCalendarWrapper({
  initialView,
}: DoctorScheduleCalendarWrapperProps) {
  const [doctors, setDoctors] = useState<DoctorSchedConfigOption[]>([])
  const [shiftsByDoctorId, setShiftsByDoctorId] = useState<Record<number, ShiftDay[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calendar-specific state (loaded on doctor click)
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null)
  const [loadingSchedules, setLoadingSchedules] = useState(false)
  const [allSchedules, setAllSchedules] = useState<DoctorSchedule[]>([])
  const [allAvailabilities, setAllAvailabilities] = useState<DoctorAvailability[]>([])

  // Cache of already-fetched full doctor schedule data (for the calendar)
  const [cachedSchedules, setCachedSchedules] = useState<Record<number, DoctorSchedule[]>>({})
  const [cachedAvailabilities, setCachedAvailabilities] = useState<Record<number, DoctorAvailability[]>>({})

  // ── Step 1: Fetch doctors + current-week shifts on mount ────────────────
  const fetchInitialData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get unique doctors
      const fetchedDoctors = await getDoctorsBySchedule()
      const uniqueMap = new Map<number, DoctorSchedConfigOption>()
      for (const doc of fetchedDoctors) {
        if (!uniqueMap.has(doc.id)) uniqueMap.set(doc.id, doc)
      }
      const uniqueDoctors = Array.from(uniqueMap.values())
      setDoctors(uniqueDoctors)

      // Fetch each doctor's schedules for the current week only
      const { monday, mondayISO, sundayISO } = getCurrentWeekRange()

      const weekSchedulesByDoc = await Promise.all(
        uniqueDoctors.map(doc =>
          getDoctorSchedules(doc.id, undefined, mondayISO, sundayISO)
            .then(schedules => {
              return { docId: doc.id, schedules }
            })
            .catch(err => {
              return { docId: doc.id, schedules: [] as DoctorSchedule[] }
            })
        )
      )

      // Fetch availabilities for each schedule returned
      const allWeekSchedules = weekSchedulesByDoc.flatMap(d => d.schedules)
      const uniqueScheduleIds = [...new Set(allWeekSchedules.map(s => s.id))]

      const availsByScheduleId: Record<number, DoctorAvailability[]> = {}

      const availResults = await Promise.all(
        uniqueScheduleIds.map(schedId =>
          getDoctorAvailabilitiesByScheduleId(schedId)
            .then(avails => {
              return { schedId, avails }
            })
            .catch(err => {
              return { schedId, avails: [] as DoctorAvailability[] }
            })
        )
      )
      for (const { schedId, avails } of availResults) {
        availsByScheduleId[schedId] = avails
      }

      // Build shift table from the fetched availabilities
      const newShifts: Record<number, ShiftDay[]> = {}
      for (const { docId, schedules } of weekSchedulesByDoc) {
        const docAvails = schedules.flatMap(s => availsByScheduleId[s.id] ?? [])
        newShifts[docId] = buildShiftsFromSchedules(schedules, docAvails, monday)
      }
      setShiftsByDoctorId(newShifts)
    } catch (err) {
      console.error('Error fetching initial data:', err)
      setError('No se pudieron cargar los datos de médicos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  // ── Step 2: On doctor click, fetch full schedules for the calendar ──────
  const fetchDoctorScheduleData = useCallback(async (docId: number) => {
    if (cachedSchedules[docId]) {
      setAllSchedules(cachedSchedules[docId])
      setAllAvailabilities(cachedAvailabilities[docId] ?? [])
      return
    }

    setLoadingSchedules(true)
    try {
      const docSchedules = await getDoctorSchedules(docId)
      const allAvailsNested = await Promise.all(
        docSchedules.map(s => getDoctorAvailabilitiesByScheduleId(s.id))
      )
      const docAvails = allAvailsNested.flat()

      setCachedSchedules(prev => ({ ...prev, [docId]: docSchedules }))
      setCachedAvailabilities(prev => ({ ...prev, [docId]: docAvails }))

      setAllSchedules(docSchedules)
      setAllAvailabilities(docAvails)
    } catch (err) {
      console.error('Error fetching doctor schedule data:', err)
    } finally {
      setLoadingSchedules(false)
    }
  }, [cachedSchedules, cachedAvailabilities])

  const handleDoctorClick = (docId: number) => {
    setSelectedDocId(docId)
    fetchDoctorScheduleData(docId)
  }

  // ── Render states ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-primary-200 shadow-sm p-8 flex flex-col items-center justify-center gap-4">
          <Spinner />
          <p className="text-sm text-cool-gray-50">Cargando médicos y turnos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-primary-200 shadow-sm p-8 flex flex-col items-center justify-center gap-4">
          <FaRegCalendarXmark className="text-3xl text-error" />
          <p className="text-sm text-error font-medium">{error}</p>
          <button
            onClick={fetchInitialData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <FaArrowsRotate /> Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (doctors.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-primary-200 shadow-sm p-8 flex flex-col items-center justify-center gap-4">
          <FaRegCalendarXmark className="text-3xl text-cool-gray-40" />
          <p className="text-sm text-cool-gray-50">No hay médicos disponibles registrados.</p>
        </div>
      </div>
    )
  }

  // ── Shift table columns ────────────────────────────────────────────────
  const allShifts = Object.values(shiftsByDoctorId).flat()
  const hasSat = allShifts.some(s => s.dayOfWeek === 6)
  const hasSun = allShifts.some(s => s.dayOfWeek === 0)
  const daysToRender = [1, 2, 3, 4, 5]
  if (hasSat) daysToRender.push(6)
  if (hasSun) daysToRender.push(0)

  return (
    <div className="space-y-6">
      {/* Doctor shift reference table — populated on mount via getDoctorSchedules(range) */}
      <div className="bg-white rounded-xl border border-primary-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-primary-200 flex items-center justify-between">
          <h2 className="text-heading-6 text-primary-800">Turnos de la semana</h2>
          <span className="text-body-xxs text-cool-gray-50">Haz clic en un médico para ver su horario</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-body-xs">
            <thead>
              <tr className="text-left text-cool-gray-50 border-b border-primary-100 bg-primary-50">
                <th className="px-4 py-2.5 font-semibold">Médico</th>
                <th className="px-4 py-2.5 font-semibold">Especialidad</th>
                <th className="px-4 py-2.5 font-semibold">Lun</th>
                <th className="px-4 py-2.5 font-semibold">Mar</th>
                <th className="px-4 py-2.5 font-semibold">Mié</th>
                <th className="px-4 py-2.5 font-semibold">Jue</th>
                <th className="px-4 py-2.5 font-semibold">Vie</th>
                {hasSat && <th className="px-4 py-2.5 font-semibold">Sáb</th>}
                {hasSun && <th className="px-4 py-2.5 font-semibold">Dom</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {doctors.map(doc => {
                const shifts = shiftsByDoctorId[doc.id] ?? []
                const byDay: Record<number, string> = {}
                for (const s of shifts) {
                  byDay[s.dayOfWeek] = `${s.startsAt}–${s.endsAt}`
                }
                const isSelected = doc.id === selectedDocId
                const isLoadingThis = loadingSchedules && doc.id === selectedDocId

                return (
                  <tr
                    key={doc.id}
                    onClick={() => handleDoctorClick(doc.id)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary-100 ring-1 ring-inset ring-primary-300' : 'hover:bg-primary-50'}`}
                  >
                    <td className="px-4 py-3 font-semibold text-primary-800">
                      {doc.user.name}
                      {isLoadingThis && <span className="ml-2 inline-block w-3 h-3 rounded-full bg-primary-400 animate-pulse" />}
                    </td>
                    <td className="px-4 py-3 text-cool-gray-60">{doc.specialty.name}</td>
                    {daysToRender.map(d => (
                      <td key={d} className="px-4 py-3">
                        {byDay[d] ? (
                          <span className="font-mono text-primary-700 text-body-xxs">{byDay[d]}</span>
                        ) : (
                          <span className="text-cool-gray-30">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive calendar — always visible, loads data on doctor click */}
      <div id="calendar" className="bg-white rounded-xl border border-primary-200 shadow-sm p-5">
        <div className="mb-4">
          <h2 className="text-heading-6 text-primary-800">Vista de citas por médico</h2>
          <p className="text-body-xs text-cool-gray-50 mt-0.5">
            {selectedDocId !== null
              ? 'Las franjas azules representan el turno programado. Haz clic en una cita para ver detalles.'
              : 'Selecciona un médico de la tabla o los botones para ver sus citas y turnos.'
            }
          </p>
        </div>

        <DoctorScheduleCalendar
          doctors={doctors}
          allSchedules={allSchedules}
          allAvailabilities={allAvailabilities}
          heightPx={620}
          initialView={initialView}
          selectedDoctorId={selectedDocId}
          onDoctorSelect={handleDoctorClick}
          loadingSchedules={loadingSchedules}
        />
      </div>
    </div>
  )
}
