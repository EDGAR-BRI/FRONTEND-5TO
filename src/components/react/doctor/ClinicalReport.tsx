import React, { useState, useEffect } from 'react';
import { FaPrint, FaArrowDownWideShort, FaSpinner } from "react-icons/fa6";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import StatCard from './StatCard';
import { getClinicalReport, exportClinicalReportPDF, type ClinicalReportResponse } from '@/lib/services/report/clinicalReport.service';
import { getToken, getDoctorId } from '@/lib/api';

export default function ClinicalReport() {
  const doctorId = getDoctorId();
  const token = getToken();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ClinicalReportResponse | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const reportData = await getClinicalReport({ 
          doctorId: doctorId ? parseInt(doctorId) : undefined 
        });
        setData(reportData);
      } catch (error) {
        console.error('Error fetching clinical report:', error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId && token) {
      fetchReport();
    }
  }, [doctorId, token]);
  // Función para exportar PDF
  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const blob = await exportClinicalReportPDF({ 
        doctorId: doctorId ? parseInt(doctorId) : undefined 
      });
      
      // Crear URL y descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-clinico-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-slate-500">No hay datos disponibles para el reporte clínico.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. Encabezado de la pantalla */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Reporte Clínico</h1>
          <p className="text-slate-500 font-medium">Análisis detallado de la actividad médica mensual.</p>
        </div>
        <button 
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? <FaSpinner className="animate-spin" /> : <FaPrint />}
          {exporting ? 'Exportando...' : 'Exportar PDF'}
        </button>
      </div>

      {/* 2. Fila de Tarjetas (Usando tu StatCard) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Consultas Totales" 
          value={data.data.stats.totalConsultations.toString()} 
          iconType="calendar" 
          trend={`+${data.data.stats.consultationsGrowth}%`} 
        />
        <StatCard 
          label="Pacientes Nuevos" 
          value={data.data.stats.newPatients.toString()} 
          iconType="users" 
          trend={`+${data.data.stats.patientsGrowth}%`} 
        />
        <StatCard 
          label="Exámenes Realizados" 
          value={data.data.stats.examsPerformed.toString()} 
          iconType="beaker" 
          trend={`+${data.data.stats.examsGrowth}%`} 
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
              <BarChart data={data.data.pathologies}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={50}>
                  {data.data.pathologies.map((entry: any, index: number) => (
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
              {data.data.recentDiagnoses.map((diagnosis, i) => (
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
    </div>
  );
}