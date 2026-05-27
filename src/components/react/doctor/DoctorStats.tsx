import { useState, useEffect, useMemo } from "react";
import { StatsCard } from "@/components/react/primary/StatsCard";
import { FaCalendarCheck, FaUserCheck } from "react-icons/fa6";
import { listConsultationsByDoctor } from "@/lib/services/medical/consultation/consultation.service";
import type { ConsultationSummary } from "@/lib/services/medical/consultation/consultation.interface";

interface DoctorStatsProps {
  doctorId: number;
}

function isSameLocalDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export default function DoctorStats({ doctorId }: DoctorStatsProps) {
  const [consultations, setConsultations] = useState<ConsultationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    listConsultationsByDoctor(doctorId)
      .then((data) => {
        if (cancelled) return;
        setConsultations(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "Error al cargar estadísticas");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayConsultations = consultations.filter((c) => {
      const dateSource = c.started_at ?? c.date;
      if (!dateSource) return false;
      const d = new Date(dateSource);
      if (Number.isNaN(d.getTime())) return false;
      return isSameLocalDay(d, now);
    });

    const citasHoy = todayConsultations.length;
    const pacientesAtendidos = todayConsultations.filter(
      (c) => c.status === "FINISHED"
    ).length;

    return { citasHoy, pacientesAtendidos };
  }, [consultations]);

  if (loading) {
    return (
      <div id="DoctorStats" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary-100 rounded-xl border border-primary-200 p-6 animate-pulse h-[120px]" />
        <div className="bg-primary-100 rounded-xl border border-primary-200 p-6 animate-pulse h-[120px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div id="DoctorStats" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-red-600 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div id="DoctorStats" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatsCard
        title="Citas Hoy"
        value={stats.citasHoy}
        color="primary"
        icon={<FaCalendarCheck />}
      />
      <StatsCard
        title="Pacientes Atendidos"
        value={stats.pacientesAtendidos}
        color="success"
        icon={<FaUserCheck />}
      />
    </div>
  );
}
