import { useState, useEffect } from 'react';
import { FaPills, FaClock, FaCalendarDays } from 'react-icons/fa6';
import { AddMedicationModal } from './AddMedicationModal';
import { EditMedicationModal } from './EditMedicationModal';
import StaticCard from '@/components/react/primary/StaticCard';
import { api } from '@/lib/api';
import { Spinner } from '@/components/react/primary/Spinner';

export const CurrentMedication = ({ patientId }: { patientId: string }) => {
  const [medications, setMedications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await api(`/medical/prescription/patient/${patientId}`);
        if (res.ok) {
          const json = await res.json();
          const arr = Array.isArray(json.data) ? json.data : [];
          setMedications(arr);
        } else {
          setMedications([]);
        }
      } catch (error) {
        console.error('Error al traer tratamientos:', error);
        setMedications([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [patientId]);

  if (isLoading) return (
    <StaticCard className="p-16 text-center flex flex-col items-center gap-4 border-dashed bg-white">
      <Spinner />
    </StaticCard>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-slate-800">Tratamientos</h3>
      </div>

      {medications.length > 0 ? (
        medications.map((med: any, i: number) => (
          <StaticCard key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
            <div className="flex items-center gap-4">
              <div className="bg-white p-4 rounded-2xl text-emerald-600 shadow-sm border border-emerald-50">
                <FaPills className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">{med.medication_name || med.supply?.name || 'Medicamento'}</p>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    {med.dosage || '-'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 italic">Recetado por: {med.consultation?.doctor?.user?.name || 'Doctor'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <FaClock className="w-3.5 h-3.5 text-emerald-500" /> {med.frequency || '-'}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <FaCalendarDays className="w-3.5 h-3.5 text-blue-500" /> {med.duration || '-'}
              </div>
            </div>

            <EditMedicationModal medication={med} />
          </StaticCard>
        ))
      ) : (
        <StaticCard className="p-16 text-center flex flex-col items-center gap-4 border-dashed bg-white">
          <div className="bg-slate-50 p-6 rounded-full text-slate-300 shadow-sm border border-slate-100">
            <FaPills className="w-14 h-14" />
          </div>
          <p className="text-slate-800 font-bold text-lg">Sin tratamientos activos</p>
        </StaticCard>
      )}
    </div>
  );
};