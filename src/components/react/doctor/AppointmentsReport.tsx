import React, { useState, useEffect } from 'react';
import { FaPrint, FaSpinner, FaCalendarCheck, FaXmark, FaCalendar } from "react-icons/fa6";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from './StatCard';
import { getAppointmentsReport, exportAppointmentsReportPDF, type AppointmentsReportResponse } from '@/lib/services/report/appointmentsReport.service';
import { getToken, getDoctorId } from '@/lib/api';
import { Modal } from '@/components/react/primary/Modal';

export default function AppointmentsReport() {
  const doctorId = getDoctorId();
  const token = getToken();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppointmentsReportResponse | null>(null);
  const [exporting, setExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const reportData = await getAppointmentsReport({ 
          doctorId: doctorId ? parseInt(doctorId) : undefined,
          status: statusFilter
        });
        setData(reportData);
      } catch (error) {
        console.error('Error fetching appointments report:', error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId && token) {
      fetchReport();
    }
  }, [doctorId, token, statusFilter]);

  // Función para exportar PDF
  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const blob = await exportAppointmentsReportPDF({ 
        doctorId: doctorId ? parseInt(doctorId) : undefined,
        status: statusFilter
      });
      
      // Crear URL y descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-citas-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsExportModalOpen(false);
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
        <p className="text-slate-500">No hay datos disponibles para el reporte de citas.</p>
      </div>
    );
  }

  // Datos para el gráfico de pastel de estados
  const statusData = [
    { name: 'Completadas', value: data.data.stats.completed, color: '#10b981' },
    { name: 'Canceladas', value: data.data.stats.cancelled, color: '#ef4444' },
    { name: 'Programadas', value: data.data.stats.scheduled, color: '#3b82f6' },
  ];

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. Encabezado de la pantalla */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Reporte de Citas</h1>
          <p className="text-slate-500 font-medium">Análisis detallado de las citas médicas.</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="all">Todas</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
            <option value="scheduled">Programadas</option>
          </select>
          <button 
            onClick={() => setIsExportModalOpen(true)}
            disabled={exporting}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? <FaSpinner className="animate-spin" /> : <FaPrint />}
            {exporting ? 'Exportando...' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      {/* 2. Fila de Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Total Citas" 
          value={data.data.stats.total.toString()} 
          iconType="calendar" 
        />
        <div className="bg-white shadow-sm rounded-xl p-5 border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-lg bg-green-50 text-green-500">
              <FaCalendarCheck size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{data.data.stats.completed}</h3>
            <p className="text-xs text-slate-400 font-medium">Completadas</p>
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-xl p-5 border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-lg bg-red-50 text-red-500">
              <FaXmark size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{data.data.stats.cancelled}</h3>
            <p className="text-xs text-slate-400 font-medium">Canceladas</p>
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-xl p-5 border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
              <FaCalendar size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{data.data.stats.scheduled}</h3>
            <p className="text-xs text-slate-400 font-medium">Programadas</p>
          </div>
        </div>
      </div>

      {/* 3. Panel de Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfica de Líneas - Evolución Diaria */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Evolución Diaria</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.data.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica de Pastel - Estados */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Distribución por Estado</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Pacientes Más Frecuentes */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Pacientes Más Frecuentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-700">Paciente</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700">Total Citas</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700">Completadas</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700">Canceladas</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700">Última Cita</th>
              </tr>
            </thead>
            <tbody>
              {data.data.topPatients.map((patient, index) => (
                <tr key={patient.patientId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <span className="font-medium text-slate-800">{patient.patientName}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-slate-600">{patient.totalAppointments}</td>
                  <td className="text-center py-3 px-4 text-green-600">{patient.completedAppointments}</td>
                  <td className="text-center py-3 px-4 text-red-600">{patient.cancelledAppointments}</td>
                  <td className="text-center py-3 px-4 text-slate-600">{new Date(patient.lastAppointmentDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)}
        title="Exportar Reporte de Citas"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Desea exportar el reporte de citas en formato PDF?
          </p>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">El reporte incluirá:</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Estadísticas de citas (total, completadas, canceladas, programadas)</li>
              <li>• Gráfica de evolución diaria</li>
              <li>• Distribución por estado</li>
              <li>• Lista de pacientes más frecuentes</li>
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
              disabled={exporting}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? <><FaSpinner className="animate-spin" /> Exportando...</> : <><FaPrint /> Exportar</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
