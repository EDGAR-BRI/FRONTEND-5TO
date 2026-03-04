import { CalendarDays, Users, FlaskConical } from "lucide-react";

export default function DashboardActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* BOTÓN: AGENDAR CITAS - Único con enlace funcional */}
      <a 
        href="schedule" 
        className="bg-[#2563eb] p-10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-blue-700 transition-all cursor-pointer shadow-lg group active:scale-95 no-underline"
      >
        <div className="bg-white/10 p-5 rounded-2xl group-hover:scale-110 transition-transform">
          <CalendarDays size={40} className="text-white" />
        </div>
        <span className="text-white font-black uppercase tracking-[0.2em] text-xs">Agendar Citas</span>
      </a>

      {/* TARJETA: PACIENTES - Sin redirección */}
      <div className="bg-[#22c55e] p-10 rounded-3xl flex flex-col items-center justify-center gap-4 shadow-lg opacity-90">
        <div className="bg-white/10 p-5 rounded-2xl">
          <Users size={40} className="text-white" />
        </div>
        <span className="text-white font-black uppercase tracking-[0.2em] text-xs">Pacientes</span>
      </div>

      {/* TARJETA: RESULTADOS - Sin redirección */}
      <div className="bg-[#f97316] p-10 rounded-3xl flex flex-col items-center justify-center gap-4 shadow-lg opacity-90">
        <div className="bg-white/10 p-5 rounded-2xl">
          <FlaskConical size={40} className="text-white" />
        </div>
        <span className="text-white font-black uppercase tracking-[0.2em] text-[10px] text-center">Resultados de Laboratorio</span>
      </div>

    </div>
  );
}