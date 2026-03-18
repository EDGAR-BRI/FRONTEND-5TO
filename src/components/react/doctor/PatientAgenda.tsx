import { useState } from "react";
import { CalendarClock, User, Clock, ChevronRight, Stethoscope, CalendarDays, FileText, Search, Filter } from "lucide-react";
import ActionCard from "../primary/ActionCard";
import { Modal } from "../primary/Modal";


const appointments = [
  {
    patient: "Carlos Mendoza",
    date: "Hoy, 14 de Oct",
    time: "09:00 AM",
    reason: "Chequeo Post-Operatorio",
    status: "CONFIRMADA",
    statusColor: "text-emerald-600 bg-emerald-50",
    notes: "Paciente requiere revisión de suturas y evaluación general de movilidad.",
    doctor: "Dr. Ramírez"
  },
  {
    patient: "Lucía Fernández",
    date: "Hoy, 14 de Oct",
    time: "11:30 AM",
    reason: "Evaluación Arritmia",
    status: "EN ESPERA",
    statusColor: "text-amber-500 bg-amber-50",
    notes: "Traer últimos resultados de Holter 24h.",
    doctor: "Dra. Silva"
  },
  {
    patient: "Roberto Gómez",
    date: "Mañana, 15 de Oct",
    time: "08:15 AM",
    reason: "Control de Hipertensión",
    status: "CONFIRMADA",
    statusColor: "text-emerald-600 bg-emerald-50",
    notes: "Revisar bitácora de presión arterial de los últimos 15 días.",
    doctor: "Dr. Ramírez"
  },
  {
    patient: "María Antonieta de las Nieves",
    date: "Jueves, 16 de Oct",
    time: "10:00 AM",
    reason: "Consulta General",
    status: "PENDIENTE",
    statusColor: "text-blue-600 bg-blue-50",
    notes: "Primera visita. Crear historial clínico completo.",
    doctor: "Dra. Andrea Pérez"
  },
  {
    patient: "José Gregorio Hernández",
    date: "Viernes, 17 de Oct",
    time: "02:30 PM",
    reason: "Lectura de Exámenes",
    status: "REPROGRAMADA",
    statusColor: "text-purple-600 bg-purple-50",
    notes: "Paciente avisó que llegaría 15 mins tarde.",
    doctor: "Dr. Ramírez"
  }
];

export default function PatientAgenda() {
  const [selectedAppt, setSelectedAppt] = useState<typeof appointments[0] | null>(null);

  return (
    <div className="flex flex-col gap-6">

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por paciente o motivo..." 
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter size={16} /> Filtros
          </button>
          <button className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-white bg-[#1e3a8a] rounded-lg hover:bg-blue-800 transition-colors shadow-sm">
            + Nueva Cita
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-[#1e293b] text-base flex items-center gap-2 uppercase tracking-wide">
            <CalendarClock size={20} className="text-[#1e3a8a]" /> Agenda de Consultas
          </h2>
        </div>

        <div className="space-y-4">
          {appointments.map((a, i) => (
            <ActionCard 
              key={i} 
              className="!flex-wrap gap-y-3 cursor-pointer border border-slate-200 hover:border-[#1e3a8a]/30 hover:shadow-md transition-all !p-4"
              onClick={() => setSelectedAppt(a)}
            >
              <div className="flex flex-1 items-center gap-5 min-w-0 w-full sm:w-auto">
                <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
                  <User size={22} />
                </div>

                <div className="min-w-0 flex flex-col gap-1.5">
                  <h4 className="font-black text-[#1e293b] text-[15px] truncate">{a.patient}</h4>
                  <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                    <Clock size={14} className="text-[#3b82f6]" /> {a.time}
                    <span className="text-slate-300">•</span>
                    <span className="italic truncate">{a.reason}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                    {a.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 ml-auto">
                <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${a.statusColor}`}>
                  {a.status}
                </span>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-[#1e3a8a] transition-colors" />
              </div>
            </ActionCard>
          ))}
        </div>
      </div>
      <Modal
        isOpen={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        title="Detalle de la Consulta"
      >
        {selectedAppt && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex items-center gap-4">
              <div className="text-[#1e3a8a] shrink-0 p-2">
                <User size={28} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Paciente</p>
                <h4 className="text-xl font-black text-[#1e293b] leading-tight mb-2 truncate">{selectedAppt.patient}</h4>
                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${selectedAppt.statusColor}`}>
                  {selectedAppt.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white">
                <div className="w-12 h-12 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Fecha y Hora</p>
                  <p className="text-base font-black text-[#1e293b] leading-tight">{selectedAppt.date}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{selectedAppt.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white">
                <div className="w-12 h-12 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Médico</p>
                  <p className="text-base font-black text-[#1e293b] leading-tight">{selectedAppt.doctor}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8fafc] p-5 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <FileText size={12}/> Motivo de Consulta
              </p>
              <p className="text-sm font-bold text-[#1e293b] mb-5">{selectedAppt.reason}</p>
              
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Notas Previas</p>
              <p className="text-[13px] text-slate-600 leading-relaxed italic">
                "{selectedAppt.notes}"
              </p>
            </div>

            <div className="pt-2 flex justify-end">

              <button 
                onClick={() => setSelectedAppt(null)} 
                className="px-6 py-2 text-sm font-bold text-[#1e3a8a] bg-white border-2 border-[#1e3a8a] rounded-lg hover:bg-blue-50 transition-colors"
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