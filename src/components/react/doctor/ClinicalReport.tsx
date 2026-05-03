import React from 'react';
import { FaPrint, FaArrowDownWideShort } from "react-icons/fa6";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import StatCard from './StatCard';

// Datos simulados (Mock Data)
const dataPatologias = [
  { name: 'Gripe', total: 40, color: '#3b82f6' },
  { name: 'Diabetes', total: 30, color: '#10b981' },
  { name: 'Asma', total: 20, color: '#f59e0b' },
  { name: 'Migraña', total: 15, color: '#ef4444' },
];

export default function ClinicalReport() {
  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. Encabezado de la pantalla */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Reporte Clínico</h1>
          <p className="text-slate-500 font-medium">Análisis detallado de la actividad médica mensual.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition shadow-lg shadow-slate-200">
          <FaPrint /> Exportar PDF
        </button>
      </div>

      {/* 2. Fila de Tarjetas (Usando tu StatCard) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Consultas Totales" value="1,250" iconType="calendar" trend="+12%" />
        <StatCard label="Pacientes Nuevos" value="320" iconType="users" trend="+5.4%" />
        <StatCard label="Exámenes Realizados" value="458" iconType="beaker" trend="+8.2%" />
      </div>

      {/* 3. Panel de Gráfica y Detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfica de Barras */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Patologías Recurrente</h3>
            <FaArrowDownWideShort className="text-slate-400" />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataPatologias}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={50}>
                  {dataPatologias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Listado lateral */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Últimos Diagnósticos</h3>
            <div className="space-y-6">
              {['Diabetes Mellitus', 'Rinitis Alérgica', 'Hipertensión Art.'].map((diag, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-100">
                    0{i+1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{diag}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Confirmado</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition">
            Ver historial completo
          </button>
        </div>

      </div>
    </div>
  );
}