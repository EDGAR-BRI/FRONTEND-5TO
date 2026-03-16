import { FlaskConical, AlertCircle, CheckCircle2, FileText } from "lucide-react";

const results = [
  {
    test: "Troponina T I (Alta Sensibilidad)",
    patient: "Carlos Mendoza",
    date: "Hace 2 horas",
    status: "Crítico",
    statusColor: "text-red-600 bg-red-50 border-red-100",
    icon: <AlertCircle size={14} />
  },
  {
    test: "Perfil Lipídico Completo",
    patient: "Lucía Fernández",
    date: "Hoy, 08:30 AM",
    status: "Normal",
    statusColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    icon: <CheckCircle2 size={14} />
  },
  {
    test: "Ecocardiograma Doppler Color",
    patient: "Roberto Gómez",
    date: "Ayer",
    status: "Pendiente Revisión",
    statusColor: "text-blue-600 bg-blue-50 border-blue-100",
    icon: <FileText size={14} />
  }
];

export default function RecentResults() {
  return (
    <div className="p-6">
      {/* Cabecera del Bloque */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 uppercase tracking-wide">
          <FlaskConical size={18} className="text-purple-500" /> Resultados de Laboratorio
        </h3>
        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md uppercase">
          3 Nuevos
        </span>
      </div>

      <div className="space-y-3">
        {results.map((r, i) => (
          <div
            key={i}
            className="group flex flex-col p-4 bg-primary-100 rounded-xl border border-primary-200 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-md hover:shadow-primary-500/30 hover:bg-primary-50/30"
          >
            <div className="flex flex-wrap justify-between items-start mb-2 gap-3 gap-y-2">
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Prueba Realizada</p>
                <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#1e3a8a] transition-colors">{r.test}</h4>
              </div>
              <div className={`flex shrink-0 items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border whitespace-nowrap ${r.statusColor}`}>
                {r.icon} {r.status}
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                  {r.patient.charAt(0)}
                </div>
                <span className="text-xs font-bold text-slate-600">{r.patient}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{r.date}</span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest border-2 border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
        Ver Historial de Laboratorio
      </button>
    </div>
  );
}