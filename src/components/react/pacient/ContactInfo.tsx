import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import StaticCard from '@/components/react/primary/StaticCard';

export const ContactInfo = () => {
  const data = {
    email: "pedro.sanchez@gmail.com",
    telefono: "+58 412-1234567",
    direccion: "Pueblo Nuevo, Edificio Sol, Apto 4B."
  };

  return (
    <StaticCard className="w-full flex flex-col h-[380px] p-8">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
        <Phone className="w-5 h-5 text-blue-500" /> Información de Contacto
      </h2>

      <div className="space-y-5">
        <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl shadow-sm border border-slate-100">
          <Mail className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Correo Electrónico</p>
            <p className="text-sm text-slate-600">{data.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl shadow-sm border border-slate-100">
          <Phone className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Teléfono Móvil</p>
            <p className="text-sm text-slate-600">{data.telefono}</p>
          </div>
        </div>
        <div className="flex items-start gap-4 bg-white/50 p-4 rounded-2xl shadow-sm border border-slate-100">
          <MapPin className="w-5 h-5 text-slate-400 mt-1" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Residencia</p>
            <p className="text-sm text-slate-600">{data.direccion}</p>
          </div>
        </div>
      </div>
    </StaticCard>
  );
};