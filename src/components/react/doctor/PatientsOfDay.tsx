import { useState, useEffect } from "react";
import { DailyAppointmentsAside } from "@/components/react/doctor/DailyAppointmentsAside";
import { listConsultationsByDoctor } from "@/lib/services/medical/consultation/consultation.service";
import type { ConsultationSummary } from "@/lib/services/medical/consultation/consultation.interface";

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

function mapToCita(consultation: ConsultationSummary): MappedCita {
  const d = new Date(consultation.date);
  let estado: "programada" | "completada" | "cancelada" = "programada";

  if (consultation.status === "FINISHED") {
    estado = "completada";
  } else if (consultation.status === "CANCELLED") {
    estado = "cancelada";
  }

  return {
    id: consultation.id,
    patientName: consultation.invoice?.patient?.name ?? "Paciente Desconocido",
    id_paciente: String(consultation.invoice?.patientId ?? ""),
    hora: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    motivo: "Consulta",
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
    listConsultationsByDoctor(doctorId)
      .then((consultations) => {
        const now = new Date();
        const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const mapped = consultations
          .filter((consultation) => {
            const dateKey = consultation.date.slice(0, 10);
            return dateKey === todayKey;
          })
          .map(mapToCita);
        mapped.sort((a, b) => a.hora.localeCompare(b.hora));
        setCitas(mapped);
        setError(null);
      })
      .catch((err) => {
        setError(err.message ?? "Error al cargar consultas del día");
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
