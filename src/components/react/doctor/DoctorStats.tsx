import { useState, useEffect } from "react";
import { StatsCard } from "@/components/react/primary/StatsCard";
import { FaCalendarCheck, FaUserCheck } from "react-icons/fa6";
import { getDoctorStats } from "@/lib/services/scheduling/appointment/appointment.service";
import type { DoctorStatsResponse } from "@/lib/services/scheduling/appointment/appointment.interface";

interface DoctorStatsProps {
  doctorId: number;
}

export default function DoctorStats({ doctorId }: DoctorStatsProps) {
  const [stats, setStats] = useState<DoctorStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) return;

    setLoading(true);
    getDoctorStats(doctorId)
      .then((data) => {
        setStats(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message ?? "Error al cargar estadísticas");
      })
      .finally(() => setLoading(false));
  }, [doctorId]);

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
        value={stats?.citasHoy ?? 0}
        color="primary"
        icon={<FaCalendarCheck />}
      />
      <StatsCard
        title="Pacientes Atendidos"
        value={stats?.pacientesAtendidos ?? 0}
        color="success"
        icon={<FaUserCheck />}
      />
    </div>
  );
}
