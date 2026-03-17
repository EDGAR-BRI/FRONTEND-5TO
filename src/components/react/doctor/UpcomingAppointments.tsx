import { useState } from "react";
import { CalendarClock, User, Clock, ChevronRight, X, FileText, Stethoscope } from "lucide-react";
import ActionCard from "../primary/ActionCard";

const appointments = [
  {
    patient: "Carlos Mendoza",
    date: "Hoy, 14 de Oct",
    time: "09:00 AM",
    reason: "Chequeo Post-Operatorio",
    status: "Confirmada",
    statusColor: "text-emerald-500 bg-emerald-50",
    notes: "Paciente requiere revisión de suturas y evaluación general de movilidad.",
    doctor: "Dr. Ramírez"
  },
  {
    patient: "Lucía Fernández",
    date: "Hoy, 14 de Oct",
    time: "11:30 AM",
    reason: "Evaluación Arritmia",
    status: "En Espera",
    statusColor: "text-amber-500 bg-amber-50",
    notes: "Traer últimos resultados de Holter 24h.",
    doctor: "Dra. Silva"
  },
  {
    patient: "Roberto Gómez",
    date: "Mañana, 15 de Oct",
    time: "08:15 AM",
    reason: "Control de Hipertensión",
    status: "Confirmada",
    statusColor: "text-emerald-500 bg-emerald-50",
    notes: "Revisar bitácora de presión arterial de los últimos 15 días.",
    doctor: "Dr. Ramírez"
  }
];

export default function UpcomingAppointments() {
  // Estado para controlar qué cita está seleccionada para el modal
  const [selectedAppt, setSelectedAppt] = useState<typeof appointments[0] | null>(null);

  return (
    <div className="p-6 relative">
      {/* Título de la sección */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 uppercase tracking-wide">
          <CalendarClock size={18} className="text-[#1e3a8a]" /> Próximas Consultas
        </h3>
        <button className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline">
          Ver Agenda Completa
        </button>
      </div>

      {/* Lista de Citas */}
      <div className="space-y-4">
        {appointments.map((a, i) => (
          <ActionCard 
            key={i} 
            className="!flex-wrap gap-y-3 cursor-pointer hover:border-blue-200"
            onClick={() => setSelectedAppt(a)} // <-- Trigger del Modal
          >
            <div className="flex flex-1 items-center gap-4 min-w-0 w-full sm:w-auto">
              <div className="w-12 h-12 shrink-0 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
                <User size={20} />
              </div>

              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 text-sm truncate">{a.patient}</h4>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Clock size={12} className="text-blue-500" /> {a.time}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-500 font-medium italic truncate">
                    {a.reason}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">
                  {a.date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 ml-auto">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${a.statusColor}`}>
                {a.status}
              </span>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-[#1e3a8a] transition-colors" />
            </div>
          </ActionCard>
        ))}
      </div>

      {/* MODAL DE DETALLE */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-[#1e3a8a]" />
                Detalle de la Consulta
              </h3>
              <button 
                onClick={() => setSelectedAppt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-6 space-y-6">
              {/* Info Paciente */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#1e3a8a]/10 rounded-full flex items-center justify-center text-[#1e3a8a]">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paciente</p>
                  <h4 className="text-lg font-bold text-slate-800 leading-none">{selectedAppt.patient}</h4>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${selectedAppt.statusColor}`}>
                    {selectedAppt.status}
                  </span>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Detalles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <CalendarClock size={12} /> Fecha y Hora
                  </p>
                  <p className="text-sm font-semibold text-slate-700">{selectedAppt.date}</p>
                  <p className="text-xs font-medium text-slate-500">{selectedAppt.time}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Stethoscope size={12} /> Médico
                  </p>
                  <p className="text-sm font-semibold text-slate-700">{selectedAppt.doctor}</p>
                </div>
              </div>

              {/* Motivo y Notas */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Motivo de Consulta</p>
                <p className="text-sm font-bold text-slate-800 mb-3">{selectedAppt.reason}</p>
                
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notas Previas</p>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{selectedAppt.notes}"
                </p>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedAppt(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button className="px-4 py-2 text-xs font-bold text-white bg-[#1e3a8a] hover:bg-blue-800 rounded-lg transition-colors shadow-sm">
                Iniciar Consulta
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}