import { useState, useEffect } from "react";
import { DailyAppointmentsAside } from "@/components/react/doctor/DailyAppointmentsAside";
import { getAppointmentsByDr } from "@/lib/services/scheduling/appointment/appointment.service";
import type { Appointment } from "@/lib/services/scheduling/appointment/appointment.interface";

interface PatientsOfDayProps {
  doctorId: number;
}

interface MappedCita {
  id: number;
  patientName: string;
  id_paciente: string;
  hora: string;
  motivo: string;
  estado: "programada" | "completada" | "cancelada";
}

function mapToCita(apt: Appointment): MappedCita {
  const d = new Date(apt.date_time);
  const statusName = apt.status?.name?.toLowerCase() ?? "pendiente";
  let estado: "programada" | "completada" | "cancelada" = "programada";

  if (statusName.includes("complet") || statusName.includes("finaliz")) {
    estado = "completada";
  } else if (statusName.includes("cancel")) {
    estado = "cancelada";
  }

  return {
    id: apt.id,
    patientName: apt.patient?.user?.name ?? "Paciente Desconocido",
    id_paciente: String(apt.patient?.id),
    hora: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    motivo: apt.reson_visit ?? "Consulta",
    estado,
  };
}

export default function PatientsOfDay({ doctorId }: PatientsOfDayProps) {
  const [citas, setCitas] = useState<MappedCita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) return;

    setLoading(true);
    getAppointmentsByDr(doctorId)
      .then((apts) => {
        const todayKey = new Date().toLocaleDateString("en-CA");
        const mapped = apts
          .filter((apt) => {
            const localDate = apt.date_time.replace("Z", "").replace(" ", "T");
            const dateKey = new Date(localDate).toLocaleDateString("en-CA");
            return dateKey === todayKey;
          })
          .map(mapToCita);
        mapped.sort((a, b) => a.hora.localeCompare(b.hora));
        setCitas(mapped);
        setError(null);
      })
      .catch((err) => {
        setError(err.message ?? "Error al cargar citas del día");
      })
      .finally(() => setLoading(false));
  }, [doctorId]);

  if (loading) {
    return (
      <aside id="patientsOfDay" className="flex flex-col gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex flex-col p-5 animate-pulse min-h-[300px]" />
      </aside>
    );
  }

  if (error) {
    return (
      <aside id="patientsOfDay" className="flex flex-col gap-6">
        <div className="bg-red-50 rounded-2xl border border-red-200 p-5 text-red-600 text-sm">
          {error}
        </div>
      </aside>
    );
  }

  return (
    <aside id="patientsOfDay" className="flex flex-col gap-6">
      <DailyAppointmentsAside citas={citas} doctorId={String(doctorId)} client:visible />
    </aside>
  );
}
