import { useState } from "react";
import { FlaskConical, AlertCircle, CheckCircle2, FileText, Activity, Clock } from "lucide-react";
import ActionCard from "../primary/ActionCard";
import { Modal } from "../primary/Modal";
import { Button } from "../primary/Button";
import { StatsCard } from "../primary/StatsCard";

const results = [
  {
    test: "Troponina T I (Alta Sensibilidad)",
    patient: "Carlos Mendoza",
    date: "Hace 2 horas",
    status: "Crítico",
    statusColor: "text-red-600 bg-red-50 border-red-100",
    icon: <AlertCircle size={14} />,
    value: "52.4 ng/L",
    reference: "< 14.0 ng/L",
    notes: "Niveles significativamente elevados. Sugiere daño miocárdico agudo. Requiere atención inmediata y correlación con ECG."
  },
  {
    test: "Perfil Lipídico Completo",
    patient: "Lucía Fernández",
    date: "Hoy, 08:30 AM",
    status: "Normal",
    statusColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    icon: <CheckCircle2 size={14} />,
    value: "175 mg/dL",
    reference: "< 200.0 mg/dL",
    notes: "Todos los valores lipídicos se encuentran dentro del rango normal. Mantener dieta y estilo de vida actual."
  },
  {
    test: "Ecocardiograma Doppler Color",
    patient: "Roberto Gómez",
    date: "Ayer",
    status: "Pendiente Revisión",
    statusColor: "text-blue-600 bg-blue-50 border-blue-100",
    icon: <FileText size={14} />,
    value: "Imágenes",
    reference: "N/A",
    notes: "Estudio completado por el equipo técnico. A la espera de la revisión y el informe detallado por el médico cardiólogo."
  }
];

export default function RecentResults() {
  const [selectedResult, setSelectedResult] = useState<typeof results[0] | null>(null);

  return (
    <div className="p-6 h-full flex flex-col">

      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 uppercase tracking-wide">
          <FlaskConical size={18} className="text-purple-500" /> Resultados de Laboratorio
        </h3>
        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-wider">
          3 Nuevos
        </span>
      </div>

      <div className="space-y-4">
        {results.map((r, i) => (
          <ActionCard 
            key={i} 
            className="flex-col !items-stretch !p-5 !bg-white !border-slate-200 hover:!border-blue-300 shadow-sm transition-all cursor-pointer"
            onClick={() => setSelectedResult(r)}
          >
            <div className="flex justify-between items-start mb-2 gap-3">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Prueba Realizada
              </p>
              <div className={`flex shrink-0 items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border whitespace-nowrap ${r.statusColor}`}>
                {r.icon} {r.status}
              </div>
            </div>

            <h4 className="font-bold text-slate-800 text-base mb-5 group-hover:text-[#1e3a8a] transition-colors">
              {r.test}
            </h4>

            <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                  {r.patient.charAt(0)}
                </div>
                <span className="text-xs font-bold text-slate-600">{r.patient}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{r.date}</span>
            </div>
          </ActionCard>
        ))}
      </div>

      <button className="w-full mt-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-colors">
        Ver Historial de Laboratorio
      </button>
      {/*MODAL*/}
      <Modal
        isOpen={!!selectedResult}
        onClose={() => setSelectedResult(null)}
        title="Detalle del Resultado"
      >
        {selectedResult && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 shrink-0 border border-purple-100">
                <FlaskConical size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Paciente</p>
                <h4 className="text-xl font-black text-slate-800 leading-tight mb-1 truncate">{selectedResult.patient}</h4>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${selectedResult.statusColor}`}>
                  {selectedResult.icon} {selectedResult.status}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Activity size={12} /> Prueba Realizada
              </p>
              <p className="text-lg font-bold text-[#1e3a8a] leading-snug">{selectedResult.test}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatsCard
                variant="compact"
                title="FECHA"
                value={selectedResult.date}
                icon={<Clock size={20} />}
                color="primary"
              />
              <StatsCard
                variant="compact"
                title="RESULTADO"
                value={selectedResult.value}
                subText={`Ref: ${selectedResult.reference}`}
                subTextClass="text-slate-500 font-medium"
                icon={<Activity size={20} />}
                color="primary"
              />
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <FileText size={12}/> Observaciones / Conclusión
              </p>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "{selectedResult.notes}"
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button 
                label="Cerrar" 
                variant="secondary" 
                onClick={() => setSelectedResult(null)} 
              />
            </div>
            
          </div>
        )}
      </Modal>
    </div>
  );
}