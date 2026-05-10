import { FaEnvelope, FaPhone, FaLocationDot } from 'react-icons/fa6';
import StaticCard from '@/components/react/primary/StaticCard';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Spinner } from '@/components/react/primary/Spinner';

type ContactInfoProps = {
  patientId: string;
  initialData?: any;
};

export const ContactInfo = ({ patientId, initialData }: ContactInfoProps) => {
  const { data: patientData, isLoading } = useSWR(
    `/medical/info-patient/patient/${patientId}`,
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnMount: !initialData,
    }
  );

  const info = patientData ?? initialData ?? null;

  if (isLoading && !info) return (
    <StaticCard className="flex h-[380px] w-full flex-col items-center justify-center rounded-[24px] border border-slate-200 bg-white/90 p-8">
      <Spinner />
    </StaticCard>
  );

  if (!info) return (
    <StaticCard className="flex h-[380px] w-full flex-col items-center justify-center rounded-[24px] border border-slate-200 bg-white/90 p-8">
      <FaPhone className="mb-3 h-12 w-12 text-slate-300" />
      <p className="text-slate-500 font-medium">Información de contacto no disponible</p>
    </StaticCard>
  );

  const email = info?.email || '-';
  const telefono = info?.main_phone || '-';
  const secondaryPhone = info?.secondary_phone || '-';
  const direccion = info?.address || '-';
  const city = info?.city || '';

  return (
    <StaticCard className="flex h-[380px] w-full flex-col rounded-[24px] border border-slate-200 bg-white/90 p-8">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-black text-slate-900">
        <FaPhone className="h-5 w-5 text-sky-500" /> Información de Contacto
      </h2>

      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <FaEnvelope className="h-5 w-5 text-slate-400" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Correo Electrónico</p>
            <p className="text-sm text-slate-600">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <FaPhone className="h-5 w-5 text-slate-400" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Teléfono Principal</p>
            <p className="text-sm text-slate-600">{telefono}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <FaPhone className="h-5 w-5 text-slate-400" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Teléfono Secundario</p>
            <p className="text-sm text-slate-600">{secondaryPhone}</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <FaLocationDot className="mt-1 h-5 w-5 text-slate-400" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Residencia</p>
            <p className="text-sm text-slate-600">{direccion}{city ? `, ${city}` : ''}</p>
          </div>
        </div>
      </div>
    </StaticCard>
  );
};