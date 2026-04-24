import { useState, useEffect, useCallback } from 'react'
import AppointmentForm from './AppointmentForm'
import AppointmentCalendar from './AppointmentCalendar'
import { getDoctorAvailability } from '@/lib/services/scheduling/doctor-availability/doctor_availability.service'
import { getAppointmentsByDr } from '@/lib/services/scheduling/appointment/appointment.service'
import type { DoctorAvailability } from '@/lib/services/scheduling/doctor-availability/doctor_availability.interface'
import type { Appointment } from '@/lib/services/scheduling/appointment/appointment.interface'

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
    const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([])
    const [loadingApts, setLoadingApts] = useState(false)

    // Cargar disponibilidad del doctor
    useEffect(() => {
        if (!selectedDoctorId) {
            setAvailableDays([])
            setDoctorSchedule([])
            setDoctorAppointments([])
            return
        }

        getDoctorAvailability(selectedDoctorId)
            .then((data: DoctorAvailability[]) => {
                setDoctorSchedule(data)
                const days = Array.from(new Set(data.map(a => a.day_of_week)))
                setAvailableDays(days)
            })
            .catch(err => {
                console.error('Error fetching doctor availability:', err)
                setAvailableDays([])
                setDoctorSchedule([])
            })
    }, [selectedDoctorId])

    // Solo para recepcionista: cargar citas del doctor seleccionado
    useEffect(() => {
        if (role !== 'receptionist' || !selectedDoctorId) {
            setDoctorAppointments([])
            return
        }

        setLoadingApts(true)
        getAppointmentsByDr(selectedDoctorId, true)
            .then((apts: Appointment[]) => {
                setDoctorAppointments(apts)
            })
            .catch(err => {
                console.error('Error fetching doctor appointments:', err)
                setDoctorAppointments([])
            })
            .finally(() => setLoadingApts(false))
    }, [selectedDoctorId, role])

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
        setTimeout(() => setDateToast(null), 2500)
    }, [])

    return (
        <div className="relative">
            {/* Toast de confirmación */}
            {dateToast && (
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 z-50 animate-bounce-in"
                    style={{ animation: 'toastSlideIn 0.3s ease, toastFadeOut 0.4s ease 2.1s forwards' }}
                >
                    <div className="bg-primary-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                        <span>✓</span>
                        <span>Fecha <strong>{dateToast}</strong> seleccionada en el formulario</span>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes toastSlideIn { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } }
                @keyframes toastFadeOut { from { opacity: 1; } to { opacity: 0; transform: translate(-50%, -10px); } }
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
                    onSuccess={() => {
                        // Refrescar citas del doctor tras crear una nueva
                        if (selectedDoctorId && role === 'receptionist') {
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
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white text-[8px] font-bold">3</span>
                            Con citas
                        </span>
                    </div>
                )}

                <div className="flex-1 overflow-x-auto">
                    <div className="min-w-[700px] h-full">
                        <AppointmentCalendar
                            role={role}
                            context={context}
                            onSelectDate={handleSelectDate}
                            availableDays={availableDays}
                            doctorAppointments={doctorAppointments}
                        />
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}
