import { useState, useEffect } from 'react'
import { Spinner } from '@/components/react/primary/Spinner'
import { FaRegCalendarXmark, FaArrowsRotate } from 'react-icons/fa6'
import DoctorScheduleCalendar from './DoctorScheduleCalendar'
import type { DoctorSchedConfigOption } from '@/lib/services/medical/doctor/doctor.interface'
import type { DoctorSchedule } from '@/lib/services/scheduling/doctor-schedule/doctor_schedule.interface'
import type { DoctorAvailability } from '@/lib/services/scheduling/doctor-availability/doctor_availability.interface'
import { getActuallyAvailableDrs } from '@/lib/services/medical/doctor/doctor.service'
import { getDoctorSchedules } from '@/lib/services/scheduling/doctor-schedule/doctor_schedule.service'
import { getDoctorAvailabilitiesByScheduleId } from '@/lib/services/scheduling/doctor-availability/doctor_availability.service'
import { formatShiftsByDoctorId, convertirAHHMM } from '@/utils/helper_functions'

export interface ShiftDay {
  dayOfWeek: number
  startsAt: string
  endsAt: string
}

export interface DoctorScheduleCalendarWrapperProps {
  initialView: 'week' | 'day' | 'agenda'
}

export default function DoctorScheduleCalendarWrapper({
  initialView,
}: DoctorScheduleCalendarWrapperProps) {
  const [doctors, setDoctors] = useState<DoctorSchedConfigOption[]>([])
  const [allSchedules, setAllSchedules] = useState<DoctorSchedule[]>([])
  const [allAvailabilities, setAllAvailabilities] = useState<DoctorAvailability[]>([])
  const [shiftsByDoctorId, setShiftsByDoctorId] = useState<Record<number, ShiftDay[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedDoctors = await getActuallyAvailableDrs()
      setDoctors(fetchedDoctors)

      const allDoctorsSchedulesNested = await Promise.all(fetchedDoctors.map(d => getDoctorSchedules(d.id)))
      const allDocsSchedules = allDoctorsSchedulesNested.flat()
      setAllSchedules(allDocsSchedules)

      const allAvailabilitiesNested = await Promise.all(
        allDocsSchedules.map(s => getDoctorAvailabilitiesByScheduleId(s.id))
      )
      const allAvails = allAvailabilitiesNested.flat()
      setAllAvailabilities(allAvails)

      const today = new Date()
      const currentDayOfWeek = today.getDay()
      const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek
      const monday = new Date(today)
      monday.setDate(today.getDate() + diffToMonday)
      monday.setHours(0, 0, 0, 0)

      const datesOfWeek = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        return d
      })

      const shiftsMap: Record<number, ShiftDay[]> = {}

      for (const doc of fetchedDoctors) {
        const schedules = allDocsSchedules.filter(s => s.doctorId === doc.id)
        const docShifts: ShiftDay[] = []

        for (let i = 0; i < 7; i++) {
          const date = datesOfWeek[i]
          const dateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
          const dayOfWeek = date.getDay()

          const activeSchedule = schedules
            .map(s => ({ ...s, _start: new Date(s.period_start), _end: s.period_end ? new Date(s.period_end) : null }))
            .filter(s => s._start <= dateUTC && (s._end === null || s._end >= dateUTC))
            .sort((a, b) => b._start.getTime() - a._start.getTime())[0]

          if (activeSchedule) {
            const availabilities = allAvails.filter(a => a.doctorScheduleId === activeSchedule.id && a.day_of_week === dayOfWeek)
            availabilities.forEach(a => {
              docShifts.push({
                dayOfWeek: a.day_of_week,
                startsAt: convertirAHHMM(a.start_time),
                endsAt: convertirAHHMM(a.end_time)
              })
            })
          }
        }
        shiftsMap[doc.id] = docShifts
      }
      setShiftsByDoctorId(shiftsMap)
    } catch (err) {
      console.error('Error fetching schedule data:', err)
      setError('No se pudieron cargar los datos de horarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-primary-200 shadow-sm p-8 flex flex-col items-center justify-center gap-4">
          <Spinner />
          <p className="text-sm text-cool-gray-50">Cargando horarios y disponibilidad...</p>
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
            onClick={fetchData}
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

  // Render shift reference table
  const allShifts = Object.values(shiftsByDoctorId).flat()
  const hasSat = allShifts.some(s => s.dayOfWeek === 6)
  const hasSun = allShifts.some(s => s.dayOfWeek === 0)
  const daysToRender = [1, 2, 3, 4, 5]
  if (hasSat) daysToRender.push(6)
  if (hasSun) daysToRender.push(0)

  return (
    <div className="space-y-6">
      {/* Doctor shift reference table */}
      <div className="bg-white rounded-xl border border-primary-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-primary-200 flex items-center justify-between">
          <h2 className="text-heading-6 text-primary-800">Turnos de la semana</h2>
          <span className="text-body-xxs text-cool-gray-50">Ciclo semanal vigente</span>
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

                return (
                  <tr key={doc.id} className="hover:bg-primary-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-primary-800">{doc.user.name}</td>
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

      {/* Interactive calendar */}
      <div id="calendar" className="bg-white rounded-xl border border-primary-200 shadow-sm p-5">
        <div className="mb-4">
          <h2 className="text-heading-6 text-primary-800">Vista de citas por médico</h2>
          <p className="text-body-xs text-cool-gray-50 mt-0.5">
            Las franjas azules representan el turno programado. Haz clic en una cita para ver detalles.
          </p>
        </div>

        <DoctorScheduleCalendar
          doctors={doctors}
          allSchedules={allSchedules}
          allAvailabilities={allAvailabilities}
          heightPx={620}
          initialView={initialView}
        />
      </div>
    </div>
  )
}
