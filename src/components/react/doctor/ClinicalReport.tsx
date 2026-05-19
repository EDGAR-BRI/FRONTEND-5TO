import React, { useState } from 'react';
import { FaPrint, FaArrowDownWideShort, FaSpinner } from "react-icons/fa6";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import StatCard from './StatCard';
import { Modal } from '@/components/react/primary/Modal';

export default function ClinicalReport() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Datos estáticos mockeados
  const mockData = {
    stats: {
      totalConsultations: 245,
      consultationsGrowth: 12,
      newPatients: 38,
      patientsGrowth: 8,
      examsPerformed: 156,
      examsGrowth: 15
    },
    pathologies: [
      { name: 'Hipertensión', total: 45, color: '#3b82f6' },
      { name: 'Diabetes Tipo 2', total: 38, color: '#10b981' },
      { name: 'Asma', total: 28, color: '#f59e0b' },
      { name: 'Artritis', total: 22, color: '#ef4444' },
      { name: 'Migraña', total: 18, color: '#8b5cf6' },
    ],
    recentDiagnoses: [
      { id: 1, diagnosis: 'Hipertensión Essencial', status: 'Confirmado' },
      { id: 2, diagnosis: 'Diabetes Mellitus Tipo 2', status: 'En Estudio' },
      { id: 3, diagnosis: 'Asma Bronquial', status: 'Confirmado' },
      { id: 4, diagnosis: 'Gastritis Crónica', status: 'Confirmado' },
      { id: 5, diagnosis: 'Ansiedad Generalizada', status: 'En Estudio' },
    ]
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    // Simular proceso de exportación
    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. Encabezado de la pantalla */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Reporte Clínico</h1>
          <p className="text-slate-500 font-medium">Análisis detallado de la actividad médica mensual.</p>
        </div>
        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition shadow-lg shadow-slate-200"
        >
          <FaPrint />
          Exportar PDF
        </button>
      </div>

      {/* 2. Fila de Tarjetas (Usando tu StatCard) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Consultas Totales" 
          value={mockData.stats.totalConsultations.toString()} 
          iconType="calendar" 
          trend={`+${mockData.stats.consultationsGrowth}%`} 
        />
        <StatCard 
          label="Pacientes Nuevos" 
          value={mockData.stats.newPatients.toString()} 
          iconType="users" 
          trend={`+${mockData.stats.patientsGrowth}%`} 
        />
        <StatCard 
          label="Exámenes Realizados" 
          value={mockData.stats.examsPerformed.toString()} 
          iconType="beaker" 
          trend={`+${mockData.stats.examsGrowth}%`} 
        />
      </div>

      {/* 3. Panel de Gráfica y Detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfica de Barras */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Patologías Recurrentes</h3>
            <FaArrowDownWideShort className="text-slate-400" />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData.pathologies}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={50}>
                  {mockData.pathologies.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
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
              {mockData.recentDiagnoses.map((diagnosis, i) => (
                <div key={diagnosis.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-100">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{diagnosis.diagnosis}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{diagnosis.status}</p>
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

      <Modal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)}
        title="Exportar Reporte Clínico"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Desea exportar el reporte clínico en formato PDF?
          </p>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">El reporte incluirá:</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Estadísticas de consultas totales y pacientes nuevos</li>
              <li>• Exámenes realizados</li>
              <li>• Gráfica de patologías recurrentes</li>
              <li>• Lista de últimos diagnósticos</li>
            </ul>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? <><FaSpinner className="animate-spin" /> Exportando...</> : <><FaPrint /> Exportar</>}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}