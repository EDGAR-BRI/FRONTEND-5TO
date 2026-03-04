import { UserPlus, Activity, CheckCircle2, TrendingUp } from "lucide-react";

const stats = [
  {
    label: "Nuevos Pacientes",
    value: "12",
    trend: "+15%",
    icon: <UserPlus size={18} className="text-blue-500" />,
    bg: "bg-blue-50"
  },
  {
    label: "En Tratamiento",
    value: "48",
    trend: "Estable",
    icon: <Activity size={18} className="text-emerald-500" />,
    bg: "bg-emerald-50"
  },
  {
    label: "Altas del Mes",
    value: "25",
    trend: "+5",
    icon: <CheckCircle2 size={18} className="text-purple-500" />,
    bg: "bg-purple-50"
  }
];

export default function PatientStats() {
  return (
    <div className="space-y-6">
      {stats.map((s, i) => (
        <div key={i} className="flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-xl transition-transform group-hover:scale-110`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                {s.label}
              </p>
              <h4 className="text-xl font-black text-slate-800 leading-none">
                {s.value}
              </h4>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
            <TrendingUp size={10} className="text-emerald-500" />
            <span className="text-[9px] font-bold text-slate-600">{s.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}