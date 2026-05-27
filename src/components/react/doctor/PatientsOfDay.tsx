import { useState, useEffect } from "react";
import { DailyAppointmentsAside } from "@/components/react/doctor/DailyAppointmentsAside";
import { listConsultationsByDoctor } from "@/lib/services/medical/consultation/consultation.service";
import type { ConsultationSummary } from "@/lib/services/medical/consultation/consultation.interface";

interface PatientsOfDayProps {
  doctorId: number;
  ClassName?: string;
}

interface MappedCita {
  id: number;
  patientName: string;
  id_paciente: string;
  hora: string;
  timestamp: number;
  motivo: string;
  estado: "programada" | "en_progreso" | "completada" | "cancelada";
  fecha: string;
  doctor: string;
  notes: string;
  rawStatus: string;
  finishedAt: string | null;
  finishedTime: string | null;
}

function mapToCita(consultation: ConsultationSummary): MappedCita {
  const dateSource = consultation.started_at ?? consultation.date;
  const d = new Date(dateSource);
  let estado: "programada" | "en_progreso" | "completada" | "cancelada" = "programada";

  if (consultation.status === "FINISHED") {
    estado = "completada";
  } else if (consultation.status === "IN_PROGRESS") {
    estado = "en_progreso";
  } else if (consultation.status === "CANCELLED") {
    estado = "cancelada";
  }

  return {
    id: consultation.id,
    patientName:
      consultation.invoice?.patient?.user?.name ??
      consultation.invoice?.patient?.name ??
      "Paciente Desconocido",
    id_paciente: String(consultation.invoice?.patientId ?? ""),
    hora: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    timestamp: d.getTime(),
    motivo: "Consulta",
    estado,
    fecha: d.toLocaleDateString("es-VE", { weekday: "short", day: "2-digit", month: "short" }),
    doctor: consultation.doctor?.user?.name ?? "Doctor",
    notes: `Factura #${consultation.invoice?.id ?? "-"}`,
    rawStatus: consultation.status,
    finishedAt: consultation.finished_at
      ? new Date(consultation.finished_at).toLocaleDateString("es-VE", { weekday: "short", day: "2-digit", month: "short" })
      : null,
    finishedTime: consultation.finished_at
      ? new Date(consultation.finished_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : null,
  };
}

function isSameLocalDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export default function PatientsOfDay({ doctorId, ClassName = "" }: PatientsOfDayProps) {
  const [citas, setCitas] = useState<MappedCita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) return;

    setLoading(true);
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    listConsultationsByDoctor(doctorId, {
      date: todayKey,
    })
      .then((consultations) => {
        const mapped = consultations
          .filter((consultation) => {
            const dateSource = consultation.started_at ?? consultation.date;
            if (!dateSource) return false;
            const d = new Date(dateSource);
            if (Number.isNaN(d.getTime())) return false;
            return isSameLocalDay(d, now);
          })
          .map(mapToCita);
        mapped.sort((a, b) => a.timestamp - b.timestamp);
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
      <aside id="patientsOfDay" className={`flex flex-col gap-6 ${ClassName}`}>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex flex-col p-5 animate-pulse min-h-[300px]" />
      </aside>
    );
  }

  if (error) {
    return (
      <aside id="patientsOfDay" className={`flex flex-col gap-6 ${ClassName}`}>
        <div className="bg-red-50 rounded-2xl border border-red-200 p-5 text-red-600 text-sm">
          {error}
        </div>
      </aside>
    );
  }

  return (
    <aside id="patientsOfDay" className={`flex flex-col gap-6 ${ClassName}`}>
      <DailyAppointmentsAside citas={citas} doctorId={String(doctorId)} />
    </aside>
  );
}
