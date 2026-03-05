import { CalendarDays, Users, FlaskConical, UserCircle } from "lucide-react";

export default function DashboardActions() {
  return (

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">


      <a
        href="schedule"
        className="bg-[#2563eb] p-8 rounded-xl flex flex-col items-center justify-center gap-4 hover:bg-blue-700 transition-all cursor-pointer shadow-lg group active:scale-95 no-underline"
      >
        <div className="bg-white/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
          <CalendarDays size={32} className="text-white" />
        </div>
        <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Agendar Citas</span>
      </a>

      <a
        href="profile"
        className="bg-[#8b5cf6] p-8 rounded-xl flex flex-col items-center justify-center gap-4 hover:bg-violet-700 transition-all cursor-pointer shadow-lg group active:scale-95 no-underline"
      >
        <div className="bg-white/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
          <UserCircle size={32} className="text-white" />
        </div>
        <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Mi Perfil</span>
      </a>


      <div className="bg-[#22c55e] p-8 rounded-xl flex flex-col items-center justify-center gap-4 shadow-lg opacity-90">
        <div className="bg-white/10 p-4 rounded-2xl">
          <Users size={32} className="text-white" />
        </div>
        <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Pacientes</span>
      </div>


      <div className="bg-[#f97316] p-8 rounded-xl flex flex-col items-center justify-center gap-4 shadow-lg opacity-90">
        <div className="bg-white/10 p-4 rounded-2xl">
          <FlaskConical size={32} className="text-white" />
        </div>
        <span className="text-white font-black uppercase tracking-[0.2em] text-[9px] text-center">Resultados</span>
      </div>

    </div>
  );
}