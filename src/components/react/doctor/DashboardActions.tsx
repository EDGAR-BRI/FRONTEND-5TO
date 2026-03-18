import { CalendarDays, Users, FlaskConical, UserCircle } from "lucide-react";
import ActionCard from "../primary/ActionCard";

export default function DashboardActions() {
  const actions = [
    { 
      label: "Agendar Citas", 
      icon: <CalendarDays size={32} />, 
      href: "schedule", 
      bg: "!bg-[#2563eb] hover:!bg-blue-700 !border-none" 
    },
    { 
      label: "Mi Perfil", 
      icon: <UserCircle size={32} />, 
      href: "profile", 
      bg: "!bg-[#8b5cf6] hover:!bg-violet-700 !border-none" 
    },
    { 
      label: "Pacientes", 
      icon: <Users size={32} />, 
      href: "patients", 
      bg: "!bg-[#22c55e] hover:!bg-green-600 !border-none" 
    },
    { 
      label: "Resultados", 
      icon: <FlaskConical size={32} />, 
      href: "results", 
      bg: "!bg-[#f97316] hover:!bg-orange-600 !border-none" 
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {actions.map((action, i) => (
        <ActionCard
          key={i}
          onClick={() => window.location.href = action.href}
          className={`flex-col justify-center gap-4 text-center h-44 !p-6 shadow-lg ${action.bg}`}
        >
          <div className="bg-white/10 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform">
            {action.icon}
          </div>
          <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">
            {action.label}
          </span>
        </ActionCard>
      ))}
    </div>
  );
}