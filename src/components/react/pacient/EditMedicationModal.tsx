import React from 'react';
import { X, Pill, Save, Trash2, AlertCircle } from 'lucide-react';

export const EditMedicationModal = ({ isOpen, onClose, medication }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        <div className="bg-slate-900 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-2xl">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest text-emerald-400">Edición de Receta</p>
              <h2 className="text-2xl font-bold">{medication?.nombre}</h2>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nueva Dosis</label>
              <input type="text" defaultValue={medication?.dosis} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Frecuencia</label>
              <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none">
                <option>{medication?.frecuencia}</option>
                <option>Cada 8 horas</option>
                <option>Cada 12 horas</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-[11px] text-amber-700 leading-tight">
              <b>Atención:</b> Si modifica la dosis sin autorización médica, podría afectar su tratamiento para la <b>Diabetes Tipo 2</b>.
            </p>
          </div>

          <section className="flex flex-col gap-3">
            <button className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all text-sm flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Guardar Cambios
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button className="py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm">
                Finalizar
              </button>
              <button className="py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all text-sm flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" /> Suspender
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};