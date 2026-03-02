import React, { useState, useEffect } from 'react';
import { ShieldAlert, User, Phone, Loader2 } from 'lucide-react';

export const EmergencyContact = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        nombre: "María Rodríguez",
        parentesco: "Madre",
        telefono: "+58 424-9876543"
      });
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center justify-center h-40 w-full">
        <Loader2 className="w-5 h-5 animate-spin text-red-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-red-50 w-full">
      <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-red-500" />
        Contacto de Emergencia
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase italic">Nombre / Parentesco</p>
            <p className="text-sm font-medium text-slate-700">{data.nombre} ({data.parentesco})</p>
          </div>
        </div>

        <section className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <Phone className="w-4 h-4 text-slate-400" />
          </div>
          <section>
            <p className="text-[10px] font-bold text-slate-400 uppercase italic">Teléfono</p>
            <p className="text-sm font-medium text-slate-700">{data.telefono}</p>
          </section>
        </section>
      </div>
    </div>
  );
};