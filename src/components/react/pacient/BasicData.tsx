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
// Importamos tu complemento de Avatar
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
    <StaticCard className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 h-full">

      {/* CABECERA: AVATAR Y NOMBRE */}
      <div className="flex flex-col items-center gap-3">
        {/* Implementación de tu componente Avatar */}
        <Avatar className="w-24 h-24 ring-4 ring-slate-50 shadow-sm">
          <AvatarImage
            src="https://i.pravatar.cc/150?img=11"
            alt="Perfil del paciente"
          />
          {/* Fallback con iniciales por si falla la imagen */}
          <AvatarFallback className="bg-slate-200 text-slate-600 font-bold text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">{fullName}</h2>
          <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
            <FaCreditCard className="w-4 h-4" /> V-{ci}
          </p>
        </div>
      </div>

      {/* CUADRICULA DE DATOS FÍSICOS */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <StaticCard className="flex flex-col items-center justify-center gap-1 py-4 text-center">
          <FaCalendarDays className="w-6 h-6 text-primary-600 mb-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Edad</span>
          <span className="text-lg font-bold text-slate-800">{age}</span>
        </StaticCard>

        <StaticCard className="flex flex-col items-center justify-center gap-1 py-4 text-center">
          <FaUser className="w-6 h-6 text-primary-600 mb-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Género</span>
          <span className="text-lg font-bold text-slate-800">{sex}</span>
        </StaticCard>

        <StaticCard className="flex flex-col items-center justify-center gap-1 py-4 text-center">
          <FaDroplet className="w-6 h-6 text-red-500 mb-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Sangre</span>
          <span className="text-lg font-bold text-slate-800">{bloodType}</span>
        </StaticCard>

        <StaticCard className="flex flex-col items-center justify-center gap-1 py-4 text-center">
          <FaWeightScale className="w-6 h-6 text-primary-600 mb-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Peso</span>
          <span className="text-lg font-bold text-slate-800">-</span>
        </StaticCard>
      </div>

      {/* NUEVA SECCIÓN: ALERTAS MÉDICAS */}
      <div className="flex flex-col gap-3 mt-2 border-t border-slate-100 pt-4">
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Resumen Médico</h4>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
          <FaShieldHalved className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="block text-xs font-bold text-red-700">Alergias</span>
            <span className="text-xs text-red-600/80 font-medium">{allergies}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <FaChartLine className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <span className="block text-xs font-bold text-blue-700">Enfermedades Crónicas</span>
            <span className="text-xs text-blue-600/80 font-medium line-clamp-2">{chronicDiseases}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <FaHeartPulse className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="block text-xs font-bold text-slate-700">Última Visita</span>
            <span className="text-xs text-slate-500 font-medium">{lastVisit}</span>
          </div>
        </div>
      </div>

    </StaticCard>
  );
};