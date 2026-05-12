import {
  FaCalendarDays,
  FaUser,
  FaDroplet,
  FaWeightScale,
  FaShieldHalved,
  FaHeartPulse,
  FaCreditCard,
  FaChartLine,
  FaUserPen,
} from "react-icons/fa6";
import StaticCard from "@/components/react/primary/StaticCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/react/primary/Avatar";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Spinner } from "@/components/react/primary/Spinner";

export const BasicData = ({ patientId }: { patientId: string }) => {
  const { data: patientData, error, isLoading } = useSWR(`/medical/info-patient/patient/${patientId}`, fetcher);
  console.log("Datos del paciente obtenidos:", patientData, "Error:", error, "Cargando:", isLoading);
  if (isLoading) return (
    <StaticCard className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 h-full items-center justify-center">
      <Spinner />
    </StaticCard>
  );

  const hasNoProfile = !patientData?.data && (error?.status === 404 || !patientData);
  
  if (hasNoProfile) return (
    <StaticCard className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 h-full items-center justify-center">
      <div className="text-center space-y-3">
        <FaUser className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="text-slate-500 font-medium text-sm">Perfil no completado</p>
        <p className="text-slate-400 text-xs">Complete su información médica para ver sus datos aquí.</p>
      </div>
    </StaticCard>
  );

  const fullName = patientData?.data?.patient?.name || 'Desconocido';
  const ci = patientData?.data?.patient?.ci || '-';
  const initials = fullName.substring(0, 2).toUpperCase();
  const bloodType = patientData?.data?.blood_type || 'No registrado';
  const chronicDiseases = patientData?.data?.chronic_diseases || 'Sin registros';
  const allergies = patientData?.data?.allergies || '-';
  const lastVisit = patientData?.data?.last_visit_at ? new Date(patientData.data.last_visit_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sin registros';
  const birthDate = patientData?.data?.birth_date ? new Date(patientData.data.birth_date) : null;
  const age = birthDate ? Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : '-';
  const sex = patientData?.data?.sex || '-';
  return (
    <StaticCard className="flex h-full flex-col gap-6 rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">

      <div className="flex flex-col items-center gap-4 rounded-[24px] bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-5 py-6 text-center">
        <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg shadow-sky-100">
          <AvatarImage
            src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(fullName)}`}
            alt="Perfil del paciente"
          />
          <AvatarFallback className="bg-slate-200 text-slate-600 font-bold text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h2 className="text-xl font-black tracking-tight text-slate-900">{fullName}</h2>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-slate-500">
            <FaCreditCard className="h-4 w-4" /> {ci}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-sky-600 px-3 py-1 text-xs font-bold text-white">{bloodType}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{sex}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{city}</span>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-4">
        <StaticCard className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white py-4 text-center shadow-sm">
          <FaCalendarDays className="mb-1 h-6 w-6 text-sky-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Edad</span>
          <span className="text-lg font-bold text-slate-800">{age}</span>
        </StaticCard>

        <StaticCard className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white py-4 text-center shadow-sm">
          <FaUser className="mb-1 h-6 w-6 text-sky-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Género</span>
          <span className="text-lg font-bold text-slate-800">{sex}</span>
        </StaticCard>

        <StaticCard className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white py-4 text-center shadow-sm">
          <FaDroplet className="mb-1 h-6 w-6 text-red-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Sangre</span>
          <span className="text-lg font-bold text-slate-800">{bloodType}</span>
        </StaticCard>

        <StaticCard className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white py-4 text-center shadow-sm">
          <FaWeightScale className="mb-1 h-6 w-6 text-sky-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Teléfono</span>
          <span className="text-sm font-bold text-slate-800">{phone}</span>
        </StaticCard>
      </div>

      <div className="mt-2 flex flex-col gap-3 border-t border-slate-100 pt-4">
        <h4 className="mb-1 text-[11px] font-black uppercase tracking-widest text-slate-400">Resumen Médico</h4>

        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-3">
          <FaShieldHalved className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <span className="block text-xs font-bold text-red-700">Alergias</span>
            <span className="text-xs text-red-600/80 font-medium">{allergies}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">
          <FaChartLine className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
          <div>
            <span className="block text-xs font-bold text-blue-700">Enfermedades Crónicas</span>
            <span className="text-xs text-blue-600/80 font-medium line-clamp-2">{chronicDiseases}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <FaHeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <div>
            <span className="block text-xs font-bold text-slate-700">Última Visita</span>
            <span className="text-xs text-slate-500 font-medium">{lastVisit}</span>
          </div>
        </div>
      </div>

    </StaticCard>
  );
};