import { Pill, Clock, Calendar } from 'lucide-react';
import { AddMedicationModal } from './AddMedicationModal';
import { EditMedicationModal } from './EditMedicationModal';
import StaticCard from '@/components/react/primary/StaticCard';

export const CurrentMedication = () => {
  const medications = [
    { nombre: "Losartán Potásico", dosis: "50mg", frecuencia: "1 tableta cada 24h", duracion: "Continuo", doctor: "Dr. Mendoza" },
    { nombre: "Aspirina Protect", dosis: "100mg", frecuencia: "1 tableta diaria", duracion: "Continuo", doctor: "Dr. Mendoza" }
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-slate-800">Medicación Actual</h3>
        {/* USAMOS EL MODAL DE AÑADIR DIRECTAMENTE */}
        <AddMedicationModal />
      </div>

      {medications.length > 0 ? (
        medications.map((med, i) => (
          <StaticCard key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-4 rounded-2xl text-emerald-600 shadow-sm">
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
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-white px-3 py-2 rounded-lg shadow-sm">
                <Clock className="w-3 h-3 text-emerald-500" /> {med.frecuencia}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-white px-3 py-2 rounded-lg shadow-sm">
                <Calendar className="w-3 h-3 text-blue-500" /> {med.duracion}
              </div>
            </div>

            {/* USAMOS EL MODAL DE EDITAR COMO DISPARADOR DEL BOTÓN GESTIONAR */}
            <EditMedicationModal medication={med} />
          </StaticCard>
        ))
      ) : (
        <StaticCard className="p-16 text-center flex flex-col items-center gap-4 border-dashed">
          <div className="bg-white p-6 rounded-full text-slate-300 shadow-sm">
            <Pill className="w-14 h-14" />
          </div>
          <p className="text-slate-800 font-bold text-lg">Sin tratamientos activos</p>
        </StaticCard>
      )}
    </div>
  );
};