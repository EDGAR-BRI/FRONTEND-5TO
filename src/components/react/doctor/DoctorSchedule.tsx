import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import AppointmentCalendar from "@/components/react/AppointmentCalendar";
import type { Cita } from "@/components/react/AppointmentCalendar";
import { getAppointmentsByDr } from "@/lib/services/scheduling/appointment/appointment.service";
import { getDoctorSchedules } from "@/lib/services/scheduling/doctor-schedule/doctor_schedule.service";
import type { Appointment } from "@/lib/services/scheduling/appointment/appointment.interface";

interface DoctorScheduleProps {
  doctorId: number;
  userId?: number;
}

function parseLocalDateTime(value: string) {
  const clean = value.replace("Z", "").replace(" ", "T");
  return new Date(clean);
}

function mapAppointmentToCita(apt: Appointment): Cita {
  const d = parseLocalDateTime(apt.date_time);
  const statusName = apt.status?.name?.toLowerCase() ?? "pendiente";
  let estado = "Pendiente";
  if (statusName.includes("complet") || statusName.includes("finaliz")) estado = "Finalizada";
  else if (statusName.includes("cancel")) estado = "Cancelada";
  else if (statusName.includes("confirm")) estado = "Confirmada";

  return {
    id: apt.id,
    pacienteNombre: apt.patient?.name ?? "Paciente",
    pacienteId: String(apt.patient?.id),
    hora: format(d, "HH:mm"),
    motivo: apt.reson_visit ?? "Consulta",
    doctor: apt.doctor?.user?.name ?? "Doctor",
    especialidad: apt.doctor?.specialty?.name ?? "General",
    fecha: format(d, "yyyy-MM-dd"),
    estado,
    tipoConsulta: "Presencial",
  };
}

export default function DoctorSchedule({ doctorId }: DoctorScheduleProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedules, setSchedules] = useState<{ id: number; period_start: string; period_end: string | null }[]>([]);
  const [availabilities, setAvailabilities] = useState<{ day_of_week: number; doctorScheduleId?: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) return;

    setLoading(true);
    Promise.all([
      getAppointmentsByDr(doctorId),
      getDoctorSchedules(doctorId),
    ])
      .then(([apts, scheds]) => {
        setAppointments(apts);
        setSchedules(
          scheds.map((s) => ({
            id: s.id,
            period_start: s.period_start,
            period_end: s.period_end,
          }))
        );
        const allAvailabilities = scheds.flatMap((s) =>
          s.availabilities.map((a) => ({
            day_of_week: a.day_of_week,
            doctorScheduleId: s.id,
          }))
        );
        setAvailabilities(allAvailabilities);
        setError(null);
      })
      .catch((err) => {
        setError(err.message ?? "Error al cargar el calendario");
      })
      .finally(() => setLoading(false));
  }, [doctorId]);

  const citas = useMemo(() => appointments.map(mapAppointmentToCita), [appointments]);

  const statusClassByEstado = useMemo(() => ({
    Pendiente: '!bg-amber-400 !text-amber-950',
    Confirmada: '!bg-emerald-600 !text-white',
    Cancelada: '!bg-rose-600 !text-white',
    Finalizada: '!bg-slate-400 !text-white',
  }), []);

  if (loading) {
    return (
      <section id="doctorSchedule" className="bg-white p-4 rounded-xl border border-primary-200 shadow-sm flex flex-col min-h-150">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Calendario de Consultas</h2>
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Cargando calendario...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="doctorSchedule" className="bg-white p-4 rounded-xl border border-primary-200 shadow-sm flex flex-col min-h-150">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Calendario de Consultas</h2>
        <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section id="doctorSchedule" className="bg-white p-4 rounded-xl border border-primary-200 shadow-sm flex flex-col min-h-150">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Calendario de Consultas</h2>
      <div className="flex-1">
        <AppointmentCalendar
          role="doctor"
          citas={citas}
          context={{ doctorId: String(doctorId) }}
          statusClassByEstado={statusClassByEstado}
          doctorAppointments={appointments}
          doctorSchedulesData={schedules}
          doctorAvailabilities={availabilities}
        />
      </div>
    </section>
  );
}
