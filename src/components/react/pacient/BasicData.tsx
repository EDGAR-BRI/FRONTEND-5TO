import { CalendarDays, User, Droplet, Scale, ShieldAlert, HeartPulse, CreditCard, Activity } from "lucide-react";
import StaticCard from "@/components/react/primary/StaticCard"; 
// Importamos tu complemento de Avatar
import { Avatar, AvatarImage, AvatarFallback } from "@/components/react/primary/Avatar";

export const BasicData = () => {
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
            JP
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Juan Pérez</h2>
          <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
            <CreditCard className="w-4 h-4" /> V-12.345.678
          </p>
        </div>
      </div>

      {/* CUADRICULA DE DATOS FÍSICOS */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <StaticCard className="flex flex-col items-center justify-center gap-1 py-4 text-center">
          <CalendarDays className="w-6 h-6 text-primary-600 mb-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Edad</span>
          <span className="text-lg font-bold text-slate-800">45 años</span>
        </StaticCard>

        <StaticCard className="flex flex-col items-center justify-center gap-1 py-4 text-center">
          <User className="w-6 h-6 text-primary-600 mb-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Género</span>
          <span className="text-lg font-bold text-slate-800">Masculino</span>
        </StaticCard>

        <StaticCard className="flex flex-col items-center justify-center gap-1 py-4 text-center">
          <Droplet className="w-6 h-6 text-red-500 mb-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Sangre</span>
          <span className="text-lg font-bold text-slate-800">O+</span>
        </StaticCard>

        <StaticCard className="flex flex-col items-center justify-center gap-1 py-4 text-center">
          <Scale className="w-6 h-6 text-primary-600 mb-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Peso</span>
          <span className="text-lg font-bold text-slate-800">78 kg</span>
        </StaticCard>
      </div>

      {/* NUEVA SECCIÓN: ALERTAS MÉDICAS */}
      <div className="flex flex-col gap-3 mt-2 border-t border-slate-100 pt-4">
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Resumen Médico</h4>
        
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="block text-xs font-bold text-red-700">Alergias</span>
            <span className="text-xs text-red-600/80 font-medium">Penicilina, Polen</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <Activity className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <span className="block text-xs font-bold text-blue-700">Condición</span>
            <span className="text-xs text-blue-600/80 font-medium">Hipertensión leve</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <HeartPulse className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="block text-xs font-bold text-slate-700">Última Visita</span>
            <span className="text-xs text-slate-500 font-medium">12 de Marzo, 2026</span>
          </div>
        </div>
      </div>

    </StaticCard>
  );
};