import { X, Pill, Save, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMedicationModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  return (
    <section className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        <div className="bg-[#0f172a] p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <section className="flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Nuevo Tratamiento</p>
              <h2 className="text-2xl font-bold">Registrar Medicamento</h2>
            </div>
          </section>
        </div>

        <div className="p-8 space-y-5">
          {/* NOMBRE Y DOSIS */}
          <section className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Medicamento</label>
              <input type="text" placeholder="Ej: Losartán" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Dosis</label>
              <input type="text" placeholder="Ej: 50mg" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
            </div>
          </section>

          {/* FRECUENCIA */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Frecuencia de toma</label>
            <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none cursor-pointer">
              <option>Cada 8 horas</option>
              <option>Cada 12 horas</option>
              <option>Una vez al día (24h)</option>
              <option>Solo en caso de dolor</option>
            </select>
          </div>

          {/* DURACIÓN */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Duración del tratamiento</label>
            <input type="text" placeholder="Ej: 7 días o Continuo" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-[11px] text-amber-700 leading-tight">
              Asegúrese de seguir las indicaciones exactas de su médico. Esta información se guardará en su historial clínico digital.
            </p>
          </div>

          <section className="grid grid-cols-2 gap-4 pt-2">
            <button onClick={onClose} className="py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm">
              Cancelar
            </button>
            <button className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all text-sm flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Guardar Receta
            </button>
          </section>
        </div>
      </div>
    </section>
  );
};