import { FaShieldHalved, FaPhone, FaPills, FaSyringe } from 'react-icons/fa6';
import StaticCard from '@/components/react/primary/StaticCard';

type EmergencyContactProps = {
  patientId: string;
  initialData?: any;
};

export const EmergencyContact = ({ initialData }: EmergencyContactProps) => {
  const info = initialData ?? null;
  const secondaryPhone = info?.secondary_phone || '-';
  const medications = info?.current_medications || 'Sin registros';
  const surgeries = info?.previous_surgeries || 'Sin registros';

  return (
    <StaticCard className="w-full rounded-[24px] border border-slate-200 bg-white/90 p-6 @container">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
        <FaShieldHalved className="h-4 w-4 text-amber-500" />
        Datos complementarios
      </h2>

      <div className="grid grid-cols-2 gap-4 @[250px]:grid-cols-1">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
          <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
            <FaPhone className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase italic text-slate-400">Teléfono secundario</p>
            <p className="text-sm font-medium text-slate-700">{secondaryPhone}</p>
          </div>
        </div>

        <section className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
          <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
            <FaPills className="h-4 w-4 text-slate-400" />
          </div>
          <section>
            <p className="text-[10px] font-bold uppercase italic text-slate-400">Medicamentos actuales</p>
            <p className="text-sm font-medium text-slate-700 line-clamp-2">{medications}</p>
          </section>
        </section>

        <section className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 shadow-sm md:col-span-2">
          <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
            <FaSyringe className="h-4 w-4 text-slate-400" />
          </div>
          <section>
            <p className="text-[10px] font-bold uppercase italic text-slate-400">Cirugías previas</p>
            <p className="text-sm font-medium text-slate-700 line-clamp-2">{surgeries}</p>
          </section>
        </section>
      </div>
    </StaticCard>
  );
};