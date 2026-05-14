import { useEffect, useMemo, useState } from "react";
import { FaChartColumn } from "react-icons/fa6";
import { getWeeklyFlowByDoctor } from "@/lib/services/scheduling/appointment/appointment.service";
import type { WeeklyFlowDay } from "@/lib/services/scheduling/appointment/appointment.interface";
import { Alert } from "@/utils/alerts";
import StaticCard from "../primary/StaticCard";

type ActivityChartProps = {
  doctorId: number;
  range?: "today" | "week" | "month" | "hoy" | "semana" | "mes";
  className?: string;
};

export default function ActivityChart({ doctorId, range = "week", className = "" }: ActivityChartProps) {
  const [activityData, setActivityData] = useState<WeeklyFlowDay[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    let isMounted = true;

    const fetchFlow = async () => {
      try {
        setIsLoading(true);
        const response = await getWeeklyFlowByDoctor(doctorId, range);
        if (!isMounted) return;
        setActivityData(response.days ?? []);
        setTotal(response.total ?? 0);
      } catch (error) {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : "Error desconocido";
        Alert.error("Error al cargar flujo", message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFlow();

    return () => {
      isMounted = false;
    };
  }, [doctorId, range]);

  const max = useMemo(() => {
    const values = activityData.map((d) => d.count);
    return values.length > 0 ? Math.max(...values) : 1;
  }, [activityData]);

  const rangeLabel = useMemo(() => {
    const normalized = range.trim().toLowerCase();
    if (normalized === "today" || normalized === "hoy") return "Hoy";
    if (normalized === "month" || normalized === "mes") return "Este mes";
    return "Últimos 7 días";
  }, [range]);

  const todayLabel = useMemo(() => {
    const dayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return dayLabels[new Date().getDay()] ?? "";
  }, []);

  const renderStatusSegments = (statuses: WeeklyFlowDay["statuses"]) => {
    if (!statuses || statuses.length === 0) return null;

    return statuses.map((status) => (
      <div key={status.name} className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: status.color || "#94a3b8" }}
        ></span>
        <span className="text-[9px] font-black text-white uppercase tracking-widest">
          {status.name}
        </span>
        <span className="text-[9px] font-black text-white">{status.count}</span>
      </div>
    ));
  };

  return (
    <StaticCard className={`bg-white gap-5 p-2 h-108.75 flex flex-col justify-between rounded-lg shadow-sm ${className}`}>

      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-primary-800 text-sm flex items-center gap-2 uppercase tracking-wide">
			<FaChartColumn size={18} className="text-blue-500" /> Flujo de Pacientes
        </h3>
        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{rangeLabel}</span>
      </div>


      <div className="mb-6">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Total Atenciones</p>
        <h4 className="text-2xl font-black text-slate-800">{total}</h4>
      </div>

      <div className="flex items-end justify-between gap-2 h-32 w-full px-2 flex-1">
        {isLoading && activityData.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Cargando...
          </div>
        )}
        {!isLoading && activityData.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Sin datos
          </div>
        )}
        {activityData.map((data, i) => {
          let barColor = "bg-slate-200"; 
          if (data.count >= 30) barColor = "bg-orange-500"; 
          if (data.day === todayLabel) barColor = "bg-[#1e3a8a]"; 

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full relative flex justify-center">
                <div className="absolute -top-8 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap z-20">
                  {data.count} pacientes
                </div>
                <div className="absolute -top-20 bg-slate-900 text-white text-[9px] px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap z-20 flex flex-col gap-1">
                  <span className="text-[9px] text-slate-200 uppercase tracking-widest">Estados</span>
                  {renderStatusSegments(data.statuses)}
                </div>
                <div 
                  className={`w-full max-w-[14px] rounded-full transition-all duration-500 cursor-pointer ${barColor} group-hover:brightness-110`}
                  style={{ height: `${(data.count / max) * 100}px` }}
                ></div>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase">{data.day}</span>
            </div>
          );
        })}
      </div>

      {/* <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
        <p className="text-[9px] text-slate-400 font-medium italic">* Datos de consulta semanal</p>
        <button className="text-[9px] font-black text-blue-600 uppercase hover:text-blue-800 transition-colors">Ver Detalles</button>
      </div> */}
    </StaticCard>
  );
}
