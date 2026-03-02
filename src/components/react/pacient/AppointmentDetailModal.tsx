import { X, Calendar, Clock, MapPin, User, Info, FileText, CheckCircle2 } from 'lucide-react';

interface Appointment {
  doctor: string;
  especialidad: string;
  fecha: string;
  hora: string;
  lugar: string;
  status: 'asistio' | 'pendiente';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const AppointmentDetailModal = ({ isOpen, onClose, appointment }: Props) => {
  if (!isOpen || !appointment) return null;

  const isCompleted = appointment.status === 'asistio';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <section className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        

        <div className="bg-[#0f172a] p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-4">

            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                {isCompleted ? 'Resumen de Cita' : 'Próxima Cita'}
              </p>
              <h2 className="text-2xl font-bold">{appointment.especialidad}</h2>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* INFO DOCTOR */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Médico Especialista</label>
            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-700">{appointment.doctor}</p>
            </div>
          </div>

          {/* GRILLA DATOS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fecha</label>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-600 flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4 text-emerald-500" /> {appointment.fecha}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Hora</label>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-600 flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-emerald-500" /> {appointment.hora}
              </div>
            </div>
          </div>

          {/* UBICACIÓN */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ubicación</label>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-600 flex items-center gap-3 font-medium">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <MapPin className="w-4 h-4 text-red-500" />
              </div>
              <p className="leading-snug text-xs">{appointment.lugar}</p>
            </div>
          </div>

          {/* MENSAJE CONDICIONAL */}
          {!isCompleted ? (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
              <span className="bg-white p-1 rounded-lg shadow-sm h-fit">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
              </span>
              <p className="text-[11px] text-amber-700 leading-tight">
                Recuerde traer su carnet de seguro y estudios previos. Llegar 15 min antes.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-[11px] text-emerald-700 leading-tight">
                Consulta completada. La información ya está en su historial.
              </p>
            </div>
          )}

          <button 
            onClick={onClose} 
            className="w-full py-4 text-white font-bold rounded-2xl transition-all text-sm bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100"
          >
            {isCompleted ? 'Cerrar Registro' : 'Entendido'}
          </button>
        </div>
      </section>
    </div>
  );
};