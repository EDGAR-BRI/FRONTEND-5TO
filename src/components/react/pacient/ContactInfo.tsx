import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Loader2 } from 'lucide-react';

export const ContactInfo = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setData({
        email: "pedro.sanchez@gmail.com",
        telefono: "+58 412-1234567",
        direccion: "Pueblo Nuevo, Edificio Sol, Apto 4B."
      });
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return (
    <div className="bg-white rounded-[2rem] border border-slate-100 h-[380px] flex items-center justify-center w-full">
      <Loader2 className="animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 w-full flex flex-col h-[380px]">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
        <Phone className="w-5 h-5 text-blue-500" /> Información de Contacto
      </h2>

      <div className="space-y-5">
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
          <Mail className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Correo Electrónico</p>
            <p className="text-sm text-slate-600">{data.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
          <Phone className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Teléfono Móvil</p>
            <p className="text-sm text-slate-600">{data.telefono}</p>
          </div>
        </div>
        <div className="flex items-start gap-4 bg-slate-50 p-4 rounded-2xl">
          <MapPin className="w-5 h-5 text-slate-400 mt-1" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Residencia</p>
            <p className="text-sm text-slate-600">{data.direccion}</p>
          </div>
        </div>
      </div>
    </div>
  );
};