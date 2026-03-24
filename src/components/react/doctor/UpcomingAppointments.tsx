import { useState } from "react";
import { CalendarClock, User, Clock, ChevronRight, Stethoscope, CalendarDays, FileText } from "lucide-react";
import ActionCard from "../primary/ActionCard";
import { Modal } from "../primary/Modal";
import { Button } from "../primary/Button";
import { StatsCard } from "../primary/StatsCard"; 

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
  const [selectedAppt, setSelectedAppt] = useState<typeof appointments[0] | null>(null);

  return (
    <div className="p-6 relative h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 uppercase tracking-wide">
          <CalendarClock size={18} className="text-[#1e3a8a]" /> Próximas Consultas a realizar
        </h3>
        <button className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline">
          Ver Agenda Completa
        </button>
      </div>

      <div className="space-y-4">
        {appointments.map((a, i) => (
          <ActionCard 
            key={i} 
            className="!flex-wrap gap-y-3 cursor-pointer hover:border-blue-200"
            onClick={() => setSelectedAppt(a)}
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
      {/* MODAL*/}
      <Modal
        isOpen={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        title="Detalle de la Consulta"
      >
        {selectedAppt && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 shrink-0">
                <User size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Paciente</p>
                <h4 className="text-xl font-black text-slate-800 leading-tight mb-1 truncate">{selectedAppt.patient}</h4>
                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${selectedAppt.statusColor}`}>
                  {selectedAppt.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatsCard
                variant="compact"
                title="FECHA Y HORA"
                value={selectedAppt.date}
                subText={selectedAppt.time}
                subTextClass="text-slate-500 font-medium"
                icon={<CalendarDays size={20} />}
                color="primary"
              />
              <StatsCard
                variant="compact"
                title="MÉDICO"
                value={selectedAppt.doctor}
                icon={<Stethoscope size={20} />}
                color="primary"
              />
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <FileText size={12}/> Motivo de Consulta
              </p>
              <p className="text-sm font-bold text-slate-800 mb-4">{selectedAppt.reason}</p>
              
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas Previas</p>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{selectedAppt.notes}"
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button 
                label="Cerrar" 
                variant="secondary" 
                onClick={() => setSelectedAppt(null)} 
              />
            </div>
            
          </div>
        )}
      </Modal>
    </div>
  );
}