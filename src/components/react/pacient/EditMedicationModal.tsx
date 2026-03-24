import React from 'react';
import { Pill, Save, Trash2, AlertCircle } from 'lucide-react';
import { ModalTrigger } from '../primary/ModalTrigger';
import { Field } from '../primary/Field';
import { Button } from '../primary/Button';

export const EditMedicationModal = ({ medication }: any) => {
  return (
    <ModalTrigger
      modalTitle="Gestión de Tratamiento"
      trigger={
        <button className="bg-white text-blue-600 text-xs font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-sm border border-blue-100/50">
          Gestionar
        </button>
      }
    >
      {({ close }) => (
        <div className="space-y-6">

          <div className="flex items-center gap-4 bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <div className="bg-emerald-500 p-3 rounded-xl shadow-lg shadow-emerald-500/20">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                Edición de Receta
              </p>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {medication?.nombre}
              </h2>
            </div>
          </div>


          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-left">
              <Field 
                label="Nueva Dosis" 
                name="dosis" 
                defaultValue={medication?.dosis} 
                placeholder="Ej: 100mg"
              />
              <Field 
                label="Frecuencia" 
                name="frecuencia" 
                defaultValue={medication?.frecuencia} 
                placeholder="Ej: Cada 12h"
              />
            </div>


            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-start text-left">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                <b className="block mb-0.5">Atención Médica:</b> 
                Cualquier cambio en la dosis debe ser validado por su doctor para evitar complicaciones en su tratamiento.
              </p>
            </div>
          </div>

          <section className="flex flex-col gap-3 pt-2">
            <Button 
              label="Guardar Cambios" 
              variant="primary" 
              onClick={close} 
              adaptive
              className="h-12 shadow-md shadow-blue-200"
            >
              <Save className="w-4 h-4" />
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                label="Finalizar" 
                variant="secondary" 
                onClick={close} 
                adaptive
                className="h-12"
              />
              
              <button 
                onClick={close}
                className="h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all text-sm border border-red-100/50"
              >
                <Trash2 className="w-4 h-4" />
                Suspender
              </button>
            </div>
          </section>
        </div>
      )}
    </ModalTrigger>
  );
};