import { FaPills, FaClock, FaCalendarDays } from 'react-icons/fa6';
import { AddMedicationModal } from './AddMedicationModal';
import { EditMedicationModal } from './EditMedicationModal';
import StaticCard from '@/components/react/primary/StaticCard';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Spinner } from '@/components/react/primary/Spinner';

export const CurrentMedication = ({ patientId }: { patientId: string }) => {
  const { data: medicationsData, isLoading } = useSWR(`/medical/prescription/patient/${patientId}`, fetcher);

  if (isLoading) return (
    <StaticCard className="p-16 text-center flex flex-col items-center gap-4 border-dashed">
      <Spinner />
    </StaticCard>
  );

  const medications = medicationsData?.data || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-slate-800">Tratamientos</h3>
      </div>

      {medications.length > 0 ? (
        medications.map((med: any, i: number) => (
          <StaticCard key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-4 rounded-2xl text-emerald-600 shadow-sm">
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
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-white px-3 py-2 rounded-lg shadow-sm">
                <FaClock className="w-3 h-3 text-emerald-500" /> {med.frequency || '-'}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-white px-3 py-2 rounded-lg shadow-sm">
                <FaCalendarDays className="w-3 h-3 text-blue-500" /> {med.duration || '-'}
              </div>
            </div>

            <EditMedicationModal medication={med} />
          </StaticCard>
        ))
      ) : (
        <StaticCard className="p-16 text-center flex flex-col items-center gap-4 border-dashed">
          <div className="bg-white p-6 rounded-full text-slate-300 shadow-sm">
            <FaPills className="w-14 h-14" />
          </div>
          <p className="text-slate-800 font-bold text-lg">Sin tratamientos activos</p>
        </StaticCard>
      )}
    </div>
  );
};