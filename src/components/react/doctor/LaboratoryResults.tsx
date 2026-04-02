import { useState } from "react";
import { FlaskConical, AlertCircle, CheckCircle2, FileText, Activity, Clock, Search, Filter } from "lucide-react";
import ActionCard from "../primary/ActionCard";
import { Modal } from "../primary/Modal";

const resultsData = [
  {
    test: "Troponina T I (Alta Sensibilidad)",
    patient: "Carlos Mendoza",
    date: "Hace 2 horas",
    status: "CRÍTICO",
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
    status: "NORMAL",
    statusColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    icon: <CheckCircle2 size={14} />,
    value: "Colesterol: 175 mg/dL",
    reference: "< 200.0 mg/dL",
    notes: "Todos los valores lipídicos se encuentran dentro del rango normal. Mantener dieta y estilo de vida actual."
  },
  {
    test: "Ecocardiograma Doppler Color",
    patient: "Roberto Gómez",
    date: "Ayer",
    status: "PENDIENTE REVISIÓN",
    statusColor: "text-blue-600 bg-blue-50 border-blue-100",
    icon: <FileText size={14} />,
    value: "Imágenes capturadas",
    reference: "N/A",
    notes: "Estudio completado por el equipo técnico. A la espera de la revisión y el informe detallado por el médico cardiólogo."
  },
  {
    test: "Hemoglobina Glicosilada (HbA1c)",
    patient: "María Antonieta de las Nieves",
    date: "12 Oct, 04:15 PM",
    status: "NORMAL",
    statusColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    icon: <CheckCircle2 size={14} />,
    value: "5.4 %",
    reference: "4.0 - 5.6 %",
    notes: "Control glucémico excelente. Continuar con el tratamiento establecido."
  }
];

export default function LaboratoryResults() {

  const [selectedResult, setSelectedResult] = useState<typeof resultsData[0] | null>(null);

  return (
    <div className="flex flex-col gap-6">
      
      {/* BARRA DE BÚSQUEDA Y FILTROS*/}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por prueba o paciente..." 
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter size={16} /> Filtros
          </button>
        </div>
      </div>

      {/* LISTA DE RESULTADOS  */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-[#1e293b] text-base flex items-center gap-2 uppercase tracking-wide">
            <FlaskConical size={20} className="text-purple-500" /> Resultados de Laboratorio
          </h2>
          <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-wider">
            {resultsData.length} Totales
          </span>
        </div>

        <div className="space-y-4">
          {resultsData.map((r, i) => (
            <ActionCard 
              key={i} 
              className="flex-col !items-stretch !p-5 !bg-white !border-slate-200 hover:!border-[#1e3a8a]/30 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedResult(r)} 
            >
              {/* Parte Superior: Etiqueta y Estado */}
              <div className="flex justify-between items-start mb-2 gap-3">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  Prueba Realizada
                </p>
                <div className={`flex shrink-0 items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border whitespace-nowrap ${r.statusColor}`}>
                  {r.icon} {r.status}
                </div>
              </div>

              {/* Parte Media: Nombre de la Prueba  */}
              <h4 className="font-bold text-slate-800 text-base mb-5 group-hover:text-[#1e3a8a] transition-colors">
                {r.test}
              </h4>

              {/* Parte Inferior: Paciente y Fecha */}
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
      </div>
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
                <h4 className="text-xl font-black text-[#1e293b] leading-tight mb-2 truncate">{selectedResult.patient}</h4>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${selectedResult.statusColor}`}>
                  {selectedResult.icon} {selectedResult.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/50">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Fecha</p>
                  <p className="text-base font-black text-[#1e293b] leading-tight">{selectedResult.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/50">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Prueba</p>
                  <p className="text-sm font-bold text-[#1e3a8a] leading-tight">{selectedResult.test}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8fafc] p-6 rounded-2xl border border-slate-100 space-y-5 shadow-inner">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <FlaskConical size={12}/> Valor Obtenido
                  </p>
                  <p className="text-3xl font-black text-[#1e293b] leading-none">{selectedResult.value}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rango de Referencia</p>
                  <p className="text-sm font-bold text-slate-500">{selectedResult.reference}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/70">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <FileText size={12}/> Observaciones / Conclusión
                </p>
                <p className="text-[13px] text-slate-600 leading-relaxed italic">
                  "{selectedResult.notes}"
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setSelectedResult(null)} 
                className="px-6 py-2.5 text-sm font-bold text-[#1e3a8a] bg-white border-2 border-[#1e3a8a] rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
              >
                Cerrar
              </button>
            </div>
            
          </div>
        )}
      </Modal>
    </div>
  );
}