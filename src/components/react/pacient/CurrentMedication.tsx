import React, { useState } from 'react';
import { Pill, Clock, Calendar, Plus } from 'lucide-react';
import { AddMedicationModal } from './AddMedicationModal';
import { EditMedicationModal } from './EditMedicationModal';

interface Medication {
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  doctor: string;
}

export const CurrentMedication = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);

  // --- LÓGICA DE DATOS ---
  const medications: Medication[] = [
    {
      nombre: "Losartán Potásico",
      dosis: "50mg",
      frecuencia: "1 tableta cada 24h",
      duracion: "Continuo",
      doctor: "Dr. Mendoza"
    },
    {
      nombre: "Aspirina Protect",
      dosis: "100mg",
      frecuencia: "1 tableta diaria",
      duracion: "Continuo",
      doctor: "Dr. Mendoza"
    }
  ];


  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-slate-800">Medicación Actual</h3>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-100"
        >
          <Plus className="w-4 h-4" /> Añadir Medicamento
        </button>
      </div>

      {medications.length > 0 ? (
        // CASO A: SI HAY MEDICAMENTOS
        medications.map((med, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-primary-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary-400">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">{med.nombre}</p>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    {med.dosis}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 italic">Recetado por: {med.doctor}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100/50">
                <Clock className="w-3 h-3 text-emerald-500" /> {med.frecuencia}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100/50">
                <Calendar className="w-3 h-3 text-blue-500" /> {med.duracion}
              </div>
            </div>

            <button
              onClick={() => setSelectedMed(med)}
              className="bg-blue-50 text-blue-600 text-xs font-bold px-8 py-3 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all border border-blue-100/50"
            >
              Gestionar
            </button>
          </div>
        ))
      ) : (
        // CASO B: ESTADO VACÍO (LIMPIO)
        <div className="bg-white p-16 rounded-lg border border-primary-200 border-dashed text-center flex flex-col items-center gap-4 shadow-sm transition-all hover:border-primary-400">
          <div className="bg-slate-50 p-6 rounded-full text-slate-200">
            <Pill className="w-14 h-14" />
          </div>
          <div className="max-w-xs">
            <p className="text-slate-800 font-bold text-lg">Sin tratamientos activos</p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              No tienes recetas o medicamentos registrados actualmente en tu historial médico digital.
            </p>
          </div>
        </div>
      )}

      <AddMedicationModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditMedicationModal
        isOpen={selectedMed !== null}
        onClose={() => setSelectedMed(null)}
        medication={selectedMed}
      />
    </div>
  );
};