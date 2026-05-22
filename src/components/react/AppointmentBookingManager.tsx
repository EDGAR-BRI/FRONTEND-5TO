import { useState, useEffect, useCallback } from 'react'
import AppointmentForm from './AppointmentForm'
import AppointmentCalendar from './AppointmentCalendar'
import { getDoctorAvailability } from '@/lib/services/scheduling/doctor-availability/doctor_availability.service'
import { getAppointmentsByDr } from '@/lib/services/scheduling/appointment/appointment.service'
import { getDoctorSchedules } from '@/lib/services/scheduling/doctor-schedule/doctor_schedule.service'
import type { DoctorAvailability } from '@/lib/services/scheduling/doctor-availability/doctor_availability.interface'
import type { Appointment } from '@/lib/services/scheduling/appointment/appointment.interface'
import type { DoctorSchedule } from '@/lib/services/scheduling/doctor-schedule/doctor_schedule.interface'

interface AppointmentBookingManagerProps {
    role: 'receptionist' | 'pacient'
    userId?: string | number
    context?: any
}

export default function AppointmentBookingManager({ role, userId, context }: AppointmentBookingManagerProps) {
    const [selectedDate, setSelectedDate] = useState<string | undefined>()
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>()
    const [availableDays, setAvailableDays] = useState<number[]>([])
    const [doctorSchedule, setDoctorSchedule] = useState<DoctorAvailability[]>([])
    const [doctorSchedulesData, setDoctorSchedulesData] = useState<DoctorSchedule[]>([])
    const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([])
    const [loadingApts, setLoadingApts] = useState(false)

    // 1. Cargar disponibilidad del doctor (Común para ambos roles)
    useEffect(() => {
        if (!selectedDoctorId) {
            setAvailableDays([])
            setDoctorSchedule([])
            setDoctorSchedulesData([])
            setDoctorAppointments([])
            return
        }

        Promise.all([
            getDoctorAvailability(selectedDoctorId),
            getDoctorSchedules(selectedDoctorId)
        ])
            .then(([availData, schedData]) => {
                setDoctorSchedule(availData)
                setDoctorSchedulesData(schedData)
                const days = Array.from(new Set(availData.map(a => a.day_of_week)))
                setAvailableDays(days)
            })
            .catch(err => {
                console.error('Error fetching doctor data:', err)
                setAvailableDays([])
                setDoctorSchedule([])
                setDoctorSchedulesData([])
                setDoctorAppointments([])
            })
    }, [selectedDoctorId])

    // 2. CORRECCIÓN VITAL: Cargar citas del doctor para TODOS los roles (recepcionista y paciente)
    useEffect(() => {
        if (!selectedDoctorId) {
            setDoctorAppointments([])
            return
        }

        setLoadingApts(true)
        getAppointmentsByDr(selectedDoctorId)
            .then((apts: Appointment[]) => {
                setDoctorAppointments(apts)
            })
            .catch(err => {
                console.error('Error fetching doctor appointments:', err)
                setDoctorAppointments([])
            })
            .finally(() => setLoadingApts(false))
    }, [selectedDoctorId]) // <-- Eliminamos la restricción de 'role'

    const handleDoctorChange = useCallback((id: string | number) => {
        const numId = Number(id)
        if (numId && numId !== selectedDoctorId) {
            setSelectedDoctorId(numId)
        } else if (!id) {
            setSelectedDoctorId(undefined)
        }
    }, [selectedDoctorId])

    const [dateToast, setDateToast] = useState<string | null>(null)

    const handleSelectDate = useCallback((date: string) => {
        setSelectedDate(date)
        setDateToast(date)
        setTimeout(() => setDateToast(null), 5000)
    }, [])

    return (
        <div className="relative">
            {/* Toast de confirmación */}
            {dateToast && (
                <div
                    className="fixed bottom-6 right-6 z-[60]"
                    style={{ animation: 'toastSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1), toastFadeOut 0.4s ease 4.6s forwards' }}
                >
                    <div className="bg-primary-700 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-primary-600/50">
                        <span className="bg-primary-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] text-white shadow-inner">✓</span>
                        <span>Fecha <strong>{dateToast}</strong> seleccionada en el formulario</span>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes toastSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes toastFadeOut { from { opacity: 1; } to { opacity: 0; transform: translateY(20px); } }
            `}</style>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-w-0">
                <div className="lg:col-span-1">
                    <AppointmentForm
                        role={role}
                        userId={userId}
                        context={context}
                        externalDate={selectedDate}
                        onDoctorChange={handleDoctorChange}
                        doctorSchedule={doctorSchedule}
                        doctorAppointments={doctorAppointments}
                        onSuccess={() => {
                            // Refrescar citas del doctor tras crear una nueva (Aplica para ambos ahora)
                            if (selectedDoctorId) {
                                getAppointmentsByDr(selectedDoctorId)
                                    .then(setDoctorAppointments)
                                    .catch(() => {})
                            }
                        }}
                    />
                </div>

                <div className="lg:col-span-3 bg-white rounded-xl border border-primary-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                    <div className="p-4 border-b border-primary-100 flex items-center justify-between bg-primary-50/30">
                        <h3 className="text-sm font-bold text-primary-800 flex items-center gap-2">
                            📅 Calendario de Disponibilidad
                        </h3>
                        <div className="flex items-center gap-2">
                            {loadingApts && (
                                <span className="text-[10px] text-primary-500 animate-pulse font-medium">
                                    Cargando citas…
                                </span>
                            )}
                            {selectedDoctorId ? (
                                <div className="flex items-center gap-2">
                                    {doctorAppointments.length > 0 && (
                                        <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">
                                            {doctorAppointments.length} cita{doctorAppointments.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                        Días de trabajo activos
                                    </span>
                                </div>
                            ) : (
                                <span className="text-[10px] bg-cool-gray-10 text-cool-gray-50 px-2 py-0.5 rounded-full font-medium italic">
                                    Selecciona un doctor para ver disponibilidad
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Leyenda visual */}
                    {selectedDoctorId && (
                        <div className="px-4 py-2 border-b border-primary-50 flex flex-wrap items-center gap-4 text-[11px] text-primary-600">
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#f0fdf4' }} />
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                                Día laborable
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#ecfdf5', borderLeft: '2px solid #059669' }} />
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white text-[8px] font-bold">●</span>
                                Con citas
                            </span>
                        </div>
                    )}

                    <div className="flex-1 overflow-x-auto">
                        <div className="min-w-[700px] h-full">
                            <MirrorCalendarWrapper 
                                role={role}
                                context={context}
                                handleSelectDate={handleSelectDate}
                                availableDays={availableDays}
                                doctorAppointments={doctorAppointments}
                                doctorSchedulesData={doctorSchedulesData}
                                doctorSchedule={doctorSchedule}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Pequeño componente auxiliar para evitar que react-big-calendar rompa tipos en el renderizado
function MirrorCalendarWrapper({ role, context, handleSelectDate, availableDays, doctorAppointments, doctorSchedulesData, doctorSchedule }: any) {
    return (
        <AppointmentCalendar
            role={role}
            context={context}
            onSelectDate={handleSelectDate}
            availableDays={availableDays}
            doctorAppointments={doctorAppointments}
            doctorSchedulesData={doctorSchedulesData}
            doctorAvailabilities={doctorSchedule}
        />
    )
}