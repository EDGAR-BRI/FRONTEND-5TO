import type { DoctorAvailability } from "@/lib/services/scheduling/doctor-availability/doctor_availability.interface"
import type { Appointment } from "@/lib/services/scheduling/appointment/appointment.interface"

export const getInitials = (name: string | null): string | null => {
    if(name == null) 
      return null
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("");
};
export function convertirAFechaISO(fechaStr: string): string {
    // Si ya viene en formato aaaa-mm-dd, devolverlo directamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
        return fechaStr;
    }
    
    // Intentar parsear la fecha
    const fecha = new Date(fechaStr);
    
    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
        throw new Error(`Formato de fecha inválido: ${fechaStr}`);
    }
    
    // Extraer año, mes y día
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    
    return `${año}-${mes}-${dia}`;
}
export function convertirAHHMM(value: string): string {
    if (/^\d{2}:\d{2}$/.test(value)) return value

    const date = new Date(value)
    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    })
}
export function formatShiftsByDoctorId(
    availabilities: DoctorAvailability[]
): Record<number, { dayOfWeek: number; startsAt: string; endsAt: string }[]> {
    return availabilities.reduce((acc, a) => {
        if (!acc[a.doctorId]) acc[a.doctorId] = []
        acc[a.doctorId].push({
            dayOfWeek: a.day_of_week,
            startsAt: convertirAHHMM(a.start_time),
            endsAt: convertirAHHMM(a.end_time),
        })
        return acc
    }, {} as Record<number, { dayOfWeek: number; startsAt: string; endsAt: string }[]>)
}
export function formatAppointmentsByDoctorId(
    appointments: Appointment[],
    durationMinutes: number = 30
): Record<number, {
    id: number
    scheduledStart: string
    scheduledEnd: string
    patientName: string
    reason: string
    status: string
    type: string
    price: string
}[]> {
    const VALID_STATUSES = ['Realizada', 'Confirmada', 'Pendiente', 'Cancelada', 'Finalizada'] as const
    type Status = typeof VALID_STATUSES[number]

    return appointments.reduce((acc, a) => {
        if (!acc[a.doctorId]) acc[a.doctorId] = []

        const start = new Date(a.date_time)
        const end = new Date(start.getTime() + durationMinutes * 60_000)

        const status = VALID_STATUSES.includes(a.status.name as Status)
            ? a.status.name as Status
            : 'Pendiente'

        acc[a.doctorId].push({
            id: a.id,
            scheduledStart: a.date_time,
            scheduledEnd: end.toISOString(),
            patientName: a.patient?.user?.name,
            reason: a.reson_visit,
            status,
            type: a.type.name,
            price: `$${a.price}`,
        })

        return acc
    }, {} as Record<number, any[]>)
}
