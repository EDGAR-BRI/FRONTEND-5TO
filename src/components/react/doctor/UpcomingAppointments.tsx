import { CalendarClock, User, Clock, ChevronRight } from "lucide-react";

const appointments = [
  {
    patient: "Carlos Mendoza",
    date: "Hoy, 14 de Oct",
    time: "09:00 AM",
    reason: "Chequeo Post-Operatorio",
    status: "Confirmada",
    statusColor: "text-emerald-500 bg-emerald-50"
  },
  {
    patient: "Lucía Fernández",
    date: "Hoy, 14 de Oct",
    time: "11:30 AM",
    reason: "Evaluación Arritmia",
    status: "En Espera",
    statusColor: "text-amber-500 bg-amber-50"
  },
  {
    patient: "Roberto Gómez",
    date: "Mañana, 15 de Oct",
    time: "08:15 AM",
    reason: "Control de Hipertensión",
    status: "Confirmada",
    statusColor: "text-emerald-500 bg-emerald-50"
  }
];

export default function UpcomingAppointments() {
  return (
    <div className="p-6">
      {/* Título de la sección */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 uppercase tracking-wide">
          <CalendarClock size={18} className="text-[#1e3a8a]" /> Próximas Consultas a Realizar
        </h3>
        <button className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline">
          Ver Agenda Completa
        </button>
      </div>

      <div className="space-y-4">
        {appointments.map((a, i) => (
          <div 
            key={i} 
            className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* Avatar e Icono */}
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
                <User size={20} />
              </div>

              {/* Información del Paciente */}
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{a.patient}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Clock size={12} className="text-blue-500" /> {a.time}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-500 font-medium italic">
                    {a.reason}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">
                  {a.date}
                </p>
              </div>
            </div>

            {/* Estado y Acción */}
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${a.statusColor}`}>
                {a.status}
              </span>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}