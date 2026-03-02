import React, { useState, useEffect } from 'react';
import { User, Droplets, Activity, Pill, Ban, Loader2, VenusAndMars } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/react/primary/Avatar";

export const BasicData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        nombre: "Pedro Javier Sánchez López",
        genero: "Masculino",
        sangre: "O+",
        alergias: "Niega alergias",
        condiciones: "Diabetes Tipo 2",
        medicamentos: "Metformina 500mg",
        iniciales: "PS"
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex items-center justify-center min-h-[500px] w-full">
      <Loader2 className="animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center w-full h-full">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 self-start mb-6">
        <User className="w-5 h-5 text-primary-600" /> Datos Médicos
      </h2>

      <Avatar className="w-28 h-28 mb-8 border-4 border-white shadow-sm rounded-full overflow-hidden">
        <AvatarFallback className="bg-slate-100 text-3xl font-bold text-primary-600 size-full flex items-center justify-center">
          {data.iniciales}
        </AvatarFallback>
      </Avatar>

      <div className="w-full space-y-5">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase italic">Nombre Completo</label>
          <div className="bg-slate-50 p-3 rounded-xl text-slate-700 text-sm flex items-center gap-3">{data.nombre}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl text-slate-700 text-sm flex items-center gap-3">
            <VenusAndMars className="w-4 h-4 text-blue-400" /> {data.genero}
          </div>
          <div className="bg-red-50 p-3 rounded-xl flex items-center justify-center gap-2 text-sm text-red-600 font-bold">
            <Droplets className="w-4 h-4" /> {data.sangre}
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-red-500 uppercase italic">Alergias Detectadas</label>
            <div className="bg-orange-50/50 p-3 rounded-xl text-slate-700 text-sm flex items-center gap-3 border border-orange-100">
              <Ban className="w-4 h-4 text-orange-500" /> {data.alergias}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Diagnóstico Activo</label>
            <div className="bg-slate-50 p-3 rounded-xl text-slate-700 text-sm flex items-center gap-3">
              <Activity className="w-4 h-4 text-primary-500" /> {data.condiciones}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase italic">Tratamiento Farmacológico</label>
            <div className="bg-emerald-50/50 p-3 rounded-xl text-slate-700 text-sm flex items-center gap-3 border border-emerald-100">
              <Pill className="w-4 h-4 text-emerald-600" /> {data.medicamentos}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};