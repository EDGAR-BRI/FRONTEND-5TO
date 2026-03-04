import { CalendarPlus, Users, FlaskConical } from "lucide-react";

const actions = [
  { 
    label: "Agendar citas", 
    icon: <CalendarPlus size={24} />, 
    color: "bg-[#2b6cb0]" 
  },
  { 
    label: "Pacientes", 
    icon: <Users size={24} />, 
    color: "bg-[#38a169]" 
  },
  { 
    label: "Resultados de laboratorio", 
    icon: <FlaskConical size={24} />, 
    color: "bg-[#ed8936]" 
  },
];

export default function DashboardActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((act, i) => (
        <button 
          key={i} 
          className={`${act.color} text-white p-7 rounded-2xl shadow-sm hover:brightness-110 transition-all transform hover:-translate-y-1 flex flex-col items-center justify-center gap-4 group relative overflow-hidden`}
        >

          <div className="bg-white/20 p-4 rounded-xl z-10 group-hover:bg-white/30 transition-colors">
            {act.icon}
          </div>
          

          <span className="text-[11px] font-black uppercase tracking-[0.15em] z-10">
            {act.label}
          </span>


          <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        </button>
      ))}
    </div>
  );
}